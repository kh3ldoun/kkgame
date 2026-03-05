import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GameRoom, Guess, Player, PlayerStats, MatchHistory, Spectator } from '@/types/game';
import { generatePlayerId, calculateHint, isValidSecret } from '@/lib/gameUtils';
import { useToast } from '@/hooks/use-toast';

const CLEANUP_HOURS = 6;

export const useGameRoom = () => {
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [player, setPlayer] = useState<Player | null>(null);
  const [spectators, setSpectators] = useState<Spectator[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();
  const subscribedRoomId = useRef<string | null>(null);
  const spectatorId = useRef<string | null>(null);

  // ─── CLEANUP ────────────────────────────────────────────────────────────────
  const cleanupRooms = useCallback(async () => {
    const cutoff = new Date(Date.now() - CLEANUP_HOURS * 60 * 60 * 1000).toISOString();
    await supabase.from('game_rooms').delete().eq('status', 'finished');
    await supabase.from('game_rooms').delete().lt('last_activity_at', cutoff);
  }, []);

  // ─── REALTIME ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!room?.id) return;
    if (subscribedRoomId.current === room.id) return;
    subscribedRoomId.current = room.id;

    const roomChannel = supabase
      .channel(`room-${room.id}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'game_rooms', filter: `id=eq.${room.id}`,
      }, (payload) => {
        if (payload.new) setRoom(prev => prev ? { ...prev, ...(payload.new as GameRoom) } : payload.new as GameRoom);
      })
      .subscribe();

    const guessChannel = supabase
      .channel(`guesses-${room.id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'guesses', filter: `room_id=eq.${room.id}`,
      }, (payload) => {
        if (payload.new) setGuesses(prev => [...prev, payload.new as Guess]);
      })
      .subscribe();

    const spectatorChannel = supabase
      .channel(`spectators-${room.id}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'spectators', filter: `room_id=eq.${room.id}`,
      }, async () => {
        const { data } = await supabase.from('spectators').select('*').eq('room_id', room.id);
        setSpectators((data as Spectator[]) || []);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(roomChannel);
      supabase.removeChannel(guessChannel);
      supabase.removeChannel(spectatorChannel);
      subscribedRoomId.current = null;
    };
  }, [room?.id]);

  // ─── JOIN / CREATE ROOM ──────────────────────────────────────────────────────
  const joinRoom = useCallback(async (roomName: string, playerName: string) => {
    setLoading(true);
    setError(null);
    try {
      await cleanupRooms();
      const playerId = generatePlayerId();
      const { data: existingRoom } = await supabase
        .from('game_rooms').select('*').eq('room_name', roomName).maybeSingle();

      if (existingRoom) {
        if (existingRoom.player2_id) throw new Error('Room is full');
        const { data: updatedRoom } = await supabase
          .from('game_rooms')
          .update({ player2_id: playerId, player2_name: playerName, status: 'waiting', last_activity_at: new Date().toISOString() })
          .eq('id', existingRoom.id).select().single();

        setRoom(updatedRoom as GameRoom);
        setPlayer({ id: playerId, name: playerName, isPlayer1: false });
        const { data } = await supabase.from('guesses').select('*').eq('room_id', existingRoom.id).order('created_at', { ascending: true });
        setGuesses((data as Guess[]) || []);
      } else {
        const { data: newRoom } = await supabase
          .from('game_rooms')
          .insert({ room_name: roomName, player1_id: playerId, player1_name: playerName, status: 'waiting', last_activity_at: new Date().toISOString() })
          .select().single();

        setRoom(newRoom as GameRoom);
        setPlayer({ id: playerId, name: playerName, isPlayer1: true });
        setGuesses([]);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Join failed';
      setError(msg);
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [cleanupRooms, toast]);

  // ─── JOIN AS SPECTATOR ───────────────────────────────────────────────────────
  const joinAsSpectator = useCallback(async (roomName: string, spectatorName: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data: existingRoom } = await supabase
        .from('game_rooms').select('*').eq('room_name', roomName).maybeSingle();

      if (!existingRoom) throw new Error('Room not found');
      if (existingRoom.status === 'finished') throw new Error('Game already finished');

      const { data: spec } = await supabase
        .from('spectators')
        .insert({ room_id: existingRoom.id, spectator_name: spectatorName })
        .select().single();

      spectatorId.current = (spec as Spectator).id;
      setRoom(existingRoom as GameRoom);
      setPlayer({ id: `spectator_${Date.now()}`, name: spectatorName, isPlayer1: false, isSpectator: true });

      const { data: existingGuesses } = await supabase
        .from('guesses').select('*').eq('room_id', existingRoom.id).order('created_at', { ascending: true });
      setGuesses((existingGuesses as Guess[]) || []);

      const { data: existingSpectators } = await supabase
        .from('spectators').select('*').eq('room_id', existingRoom.id);
      setSpectators((existingSpectators as Spectator[]) || []);

      toast({ title: '👁️ Spectating', description: `You are now watching the game in ${roomName}` });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to join as spectator';
      setError(msg);
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // ─── SET SECRET ──────────────────────────────────────────────────────────────
  const setSecret = useCallback(async (secret: string) => {
    if (!room || !player || !isValidSecret(secret)) return;
    setLoading(true);
    try {
      const field = player.isPlayer1 ? 'player1_secret' : 'player2_secret';
      const { data } = await supabase
        .from('game_rooms')
        .update({ [field]: secret, last_activity_at: new Date().toISOString() })
        .eq('id', room.id).select().single();

      const r = data as GameRoom;
      if (r.player1_secret && r.player2_secret && r.player2_id) {
        await supabase.from('game_rooms').update({
          status: 'playing',
          started_at: new Date().toISOString(),
          current_turn: r.player1_id,
          last_activity_at: new Date().toISOString(),
        }).eq('id', room.id);
      }
      setRoom(r);
    } finally {
      setLoading(false);
    }
  }, [room, player]);

  // ─── MAKE GUESS ──────────────────────────────────────────────────────────────
  const makeGuess = useCallback(async (guessValue: string) => {
    if (!room || !player) return;
    if (!isValidSecret(guessValue)) return;
    if (room.current_turn !== player.id) return;

    setLoading(true);
    try {
      const opponentSecret = player.isPlayer1 ? room.player2_secret : room.player1_secret;
      if (!opponentSecret) return;

      const hint = calculateHint(guessValue, opponentSecret);
      const isWin = hint.includes('win');

      await supabase.from('guesses').insert({
        room_id: room.id, player_id: player.id,
        player_name: player.name, guess: guessValue, hint,
      });

      if (isWin) {
        await supabase.from('game_rooms').update({
          status: 'finished', winner_name: player.name,
          ended_at: new Date().toISOString(), last_activity_at: new Date().toISOString(),
        }).eq('id', room.id);

        // ── Save match history & update stats ──
        await saveMatchResult(room, player, guesses, isWin);
      } else {
        const nextTurn = player.isPlayer1 ? room.player2_id : room.player1_id;
        await supabase.from('game_rooms').update({
          current_turn: nextTurn, last_activity_at: new Date().toISOString(),
        }).eq('id', room.id);
      }
    } finally {
      setLoading(false);
    }
  }, [room, player, guesses]);

  // ─── SAVE MATCH RESULT ───────────────────────────────────────────────────────
  const saveMatchResult = async (room: GameRoom, winner: Player, currentGuesses: Guess[], winnerWon: boolean) => {
    try {
      const p1Guesses = currentGuesses.filter(g => g.player_id === room.player1_id).length + (winnerWon && winner.isPlayer1 ? 1 : 0);
      const p2Guesses = currentGuesses.filter(g => g.player_id === room.player2_id).length + (winnerWon && !winner.isPlayer1 ? 1 : 0);
      const durationSec = room.started_at
        ? Math.floor((Date.now() - new Date(room.started_at).getTime()) / 1000)
        : null;

      // Save match history
      await supabase.from('match_history').insert({
        room_name: room.room_name,
        player1_name: room.player1_name,
        player2_name: room.player2_name,
        winner_name: winner.name,
        player1_guesses: p1Guesses,
        player2_guesses: p2Guesses,
        duration_seconds: durationSec,
        started_at: room.started_at,
        ended_at: new Date().toISOString(),
      });

      // Update winner stats
      if (room.player1_name) await upsertPlayerStats(room.player1_name, winner.name === room.player1_name, p1Guesses);
      if (room.player2_name) await upsertPlayerStats(room.player2_name, winner.name === room.player2_name, p2Guesses);
    } catch (e) {
      console.error('Failed to save match result:', e);
    }
  };

  const upsertPlayerStats = async (playerName: string, won: boolean, guessCount: number) => {
    const { data: existing } = await supabase
      .from('player_stats').select('*').eq('player_name', playerName).maybeSingle();

    if (existing) {
      await supabase.from('player_stats').update({
        wins: existing.wins + (won ? 1 : 0),
        losses: existing.losses + (won ? 0 : 1),
        total_games: existing.total_games + 1,
        total_guesses: existing.total_guesses + guessCount,
        best_guesses: won
          ? existing.best_guesses === null ? guessCount : Math.min(existing.best_guesses, guessCount)
          : existing.best_guesses,
        updated_at: new Date().toISOString(),
      }).eq('player_name', playerName);
    } else {
      await supabase.from('player_stats').insert({
        player_name: playerName,
        wins: won ? 1 : 0,
        losses: won ? 0 : 1,
        total_games: 1,
        total_guesses: guessCount,
        best_guesses: won ? guessCount : null,
      });
    }
  };

  // ─── LEAVE ROOM ──────────────────────────────────────────────────────────────
  const leaveRoom = useCallback(async () => {
    // Remove spectator record if applicable
    if (spectatorId.current) {
      await supabase.from('spectators').delete().eq('id', spectatorId.current);
      spectatorId.current = null;
    }
    setRoom(null);
    setPlayer(null);
    setGuesses([]);
    setSpectators([]);
    setError(null);
    subscribedRoomId.current = null;
  }, []);

  return {
    room, guesses, player, spectators, loading, error,
    joinRoom, joinAsSpectator, setSecret, makeGuess, leaveRoom,
  };
};
