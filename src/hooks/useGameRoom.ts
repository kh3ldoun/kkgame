import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GameRoom, Guess, Player } from '@/types/game';
import { generatePlayerId, calculateHint, isValidSecret } from '@/lib/gameUtils';
import { useToast } from '@/hooks/use-toast';

const CLEANUP_HOURS = 6;

export const useGameRoom = () => {
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  // 🧠 يمنع إعادة الاشتراك لنفس الغرفة
  const subscribedRoomId = useRef<string | null>(null);

  /* =========================
     🧹 CLEANUP ROOMS
  ========================= */
  const cleanupRooms = useCallback(async () => {
    const cutoff = new Date(
      Date.now() - CLEANUP_HOURS * 60 * 60 * 1000
    ).toISOString();

    await supabase.from('game_rooms').delete().eq('status', 'finished');
    await supabase.from('game_rooms').delete().lt('last_activity_at', cutoff);
  }, []);

  /* =========================
     📡 REALTIME SUBSCRIPTIONS
  ========================= */
  useEffect(() => {
    if (!room?.id) return;

    // 🚫 لا تعيد الاشتراك إذا نفس الغرفة
    if (subscribedRoomId.current === room.id) return;
    subscribedRoomId.current = room.id;

    const roomChannel = supabase
      .channel(`room-${room.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'game_rooms',
          filter: `id=eq.${room.id}`,
        },
        (payload) => {
          if (payload.new) {
            setRoom((prev) =>
              prev
                ? { ...prev, ...(payload.new as GameRoom) }
                : (payload.new as GameRoom)
            );
          }
        }
      )
      .subscribe();

    const guessChannel = supabase
      .channel(`guesses-${room.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'guesses',
          filter: `room_id=eq.${room.id}`,
        },
        (payload) => {
          if (payload.new) {
            setGuesses((prev) => [...prev, payload.new as Guess]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(roomChannel);
      supabase.removeChannel(guessChannel);
      subscribedRoomId.current = null;
    };
  }, [room?.id]);

  /* =========================
     🚪 JOIN / CREATE ROOM
  ========================= */
  const joinRoom = useCallback(
    async (roomName: string, playerName: string) => {
      setLoading(true);
      setError(null);

      try {
        await cleanupRooms();

        const playerId = generatePlayerId();

        const { data: existingRoom } = await supabase
          .from('game_rooms')
          .select('*')
          .eq('room_name', roomName)
          .maybeSingle();

        if (existingRoom) {
          if (existingRoom.player2_id) {
            throw new Error('Room is full');
          }

          const { data: updatedRoom } = await supabase
            .from('game_rooms')
            .update({
              player2_id: playerId,
              player2_name: playerName,
              status: 'waiting',
              last_activity_at: new Date().toISOString(),
            })
            .eq('id', existingRoom.id)
            .select()
            .single();

          setRoom(updatedRoom as GameRoom);
          setPlayer({ id: playerId, name: playerName, isPlayer1: false });

          const { data } = await supabase
            .from('guesses')
            .select('*')
            .eq('room_id', existingRoom.id)
            .order('created_at', { ascending: true });

          setGuesses((data as Guess[]) || []);
        } else {
          const { data: newRoom } = await supabase
            .from('game_rooms')
            .insert({
              room_name: roomName,
              player1_id: playerId,
              player1_name: playerName,
              status: 'waiting',
              last_activity_at: new Date().toISOString(),
            })
            .select()
            .single();

          setRoom(newRoom as GameRoom);
          setPlayer({ id: playerId, name: playerName, isPlayer1: true });
          setGuesses([]);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Join failed';
        setError(msg);
        toast({
          title: 'Error',
          description: msg,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    },
    [cleanupRooms, toast]
  );

  /* =========================
     🔐 SET SECRET
  ========================= */
  const setSecret = useCallback(
    async (secret: string) => {
      if (!room || !player || !isValidSecret(secret)) return;

      setLoading(true);

      try {
        const field = player.isPlayer1 ? 'player1_secret' : 'player2_secret';

        const { data } = await supabase
          .from('game_rooms')
          .update({
            [field]: secret,
            last_activity_at: new Date().toISOString(),
          })
          .eq('id', room.id)
          .select()
          .single();

        const r = data as GameRoom;

        if (r.player1_secret && r.player2_secret && r.player2_id) {
          await supabase
            .from('game_rooms')
            .update({
              status: 'playing',
              started_at: new Date().toISOString(),
              current_turn: r.player1_id,
              last_activity_at: new Date().toISOString(),
            })
            .eq('id', room.id);
        }

        setRoom(r);
      } finally {
        setLoading(false);
      }
    },
    [room, player]
  );

  /* =========================
     🎯 MAKE GUESS
  ========================= */
  const makeGuess = useCallback(
    async (guessValue: string) => {
      if (!room || !player) return;
      if (!isValidSecret(guessValue)) return;
      if (room.current_turn !== player.id) return;

      setLoading(true);

      try {
        const opponentSecret = player.isPlayer1
          ? room.player2_secret
          : room.player1_secret;

        if (!opponentSecret) return;

        const hint = calculateHint(guessValue, opponentSecret);
        const isWin = hint.includes('win');

        await supabase.from('guesses').insert({
          room_id: room.id,
          player_id: player.id,
          player_name: player.name,
          guess: guessValue,
          hint,
        });

        if (isWin) {
          await supabase
            .from('game_rooms')
            .update({
              status: 'finished',
              winner_name: player.name,
              ended_at: new Date().toISOString(),
              last_activity_at: new Date().toISOString(),
            })
            .eq('id', room.id);
        } else {
          const nextTurn = player.isPlayer1
            ? room.player2_id
            : room.player1_id;

          await supabase
            .from('game_rooms')
            .update({
              current_turn: nextTurn,
              last_activity_at: new Date().toISOString(),
            })
            .eq('id', room.id);
        }
      } finally {
        setLoading(false);
      }
    },
    [room, player]
  );

  const leaveRoom = useCallback(() => {
    setRoom(null);
    setPlayer(null);
    setGuesses([]);
    setError(null);
    subscribedRoomId.current = null;
  }, []);

  return {
    room,
    guesses,
    player,
    loading,
    error,
    joinRoom,
    setSecret,
    makeGuess,
    leaveRoom,
  };
};
