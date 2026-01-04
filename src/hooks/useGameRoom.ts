import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GameRoom, Guess, Player } from '@/types/game';
import { generatePlayerId, calculateHint, isValidSecret } from '@/lib/gameUtils';
import { useToast } from '@/hooks/use-toast';

export const useGameRoom = () => {
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Subscribe to room changes
  useEffect(() => {
    if (!room?.id) return;

    const roomChannel = supabase
      .channel(`room-${room.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_rooms',
          filter: `id=eq.${room.id}`,
        },
        (payload) => {
          if (payload.new) {
            setRoom(payload.new as GameRoom);
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
    };
  }, [room?.id]);

  // Create or join room
  const joinRoom = useCallback(async (roomName: string, playerName: string) => {
    setLoading(true);
    setError(null);

    try {
      const playerId = generatePlayerId();

      // Check if room exists
      const { data: existingRoom, error: fetchError } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('room_name', roomName)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingRoom) {
        // Room exists - try to join as player 2
        if (existingRoom.player2_id) {
          throw new Error('Room is full! Only 2 players allowed.');
        }

        const { data: updatedRoom, error: updateError } = await supabase
          .from('game_rooms')
          .update({
            player2_id: playerId,
            player2_name: playerName,
            status: 'waiting',
          })
          .eq('id', existingRoom.id)
          .select()
          .single();

        if (updateError) throw updateError;

        setRoom(updatedRoom as GameRoom);
        setPlayer({ id: playerId, name: playerName, isPlayer1: false });

        // Fetch existing guesses
        const { data: existingGuesses } = await supabase
          .from('guesses')
          .select('*')
          .eq('room_id', existingRoom.id)
          .order('created_at', { ascending: true });

        setGuesses((existingGuesses as Guess[]) || []);

        toast({
          title: 'Joined room!',
          description: `You joined as ${playerName}`,
        });
      } else {
        // Create new room
        const { data: newRoom, error: createError } = await supabase
          .from('game_rooms')
          .insert({
            room_name: roomName,
            player1_id: playerId,
            player1_name: playerName,
            status: 'waiting',
          })
          .select()
          .single();

        if (createError) throw createError;

        setRoom(newRoom as GameRoom);
        setPlayer({ id: playerId, name: playerName, isPlayer1: true });
        setGuesses([]);

        toast({
          title: 'Room created!',
          description: 'Waiting for opponent to join...',
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to join room';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Set secret number
  const setSecret = useCallback(async (secret: string) => {
    if (!room || !player) return;
    if (!isValidSecret(secret)) {
      toast({
        title: 'Invalid secret',
        description: 'Please enter exactly 3 digits',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const updateField = player.isPlayer1 ? 'player1_secret' : 'player2_secret';
      
      const { data: updatedRoom, error: updateError } = await supabase
        .from('game_rooms')
        .update({ [updateField]: secret })
        .eq('id', room.id)
        .select()
        .single();

      if (updateError) throw updateError;

      const roomData = updatedRoom as GameRoom;

      // Check if both players have set secrets - start the game
      if (roomData.player1_secret && roomData.player2_secret && roomData.player2_id) {
        const { error: startError } = await supabase
          .from('game_rooms')
          .update({
            status: 'playing',
            started_at: new Date().toISOString(),
            current_turn: roomData.player1_id, // Player 1 goes first
          })
          .eq('id', room.id);

        if (startError) throw startError;
      }

      setRoom(roomData);
      toast({
        title: 'Secret saved!',
        description: 'Your secret number has been locked in.',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to save secret',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [room, player, toast]);

  // Make a guess
  const makeGuess = useCallback(async (guessValue: string) => {
    if (!room || !player) return;
    if (!isValidSecret(guessValue)) {
      toast({
        title: 'Invalid guess',
        description: 'Please enter exactly 3 digits',
        variant: 'destructive',
      });
      return;
    }

    if (room.current_turn !== player.id) {
      toast({
        title: 'Not your turn',
        description: 'Wait for your opponent to guess',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Get opponent's secret
      const opponentSecret = player.isPlayer1 ? room.player2_secret : room.player1_secret;
      
      if (!opponentSecret) {
        throw new Error('Opponent secret not found');
      }

      const hint = calculateHint(guessValue, opponentSecret);
      const isWin = hint.includes('win');

      // Insert guess
      const { error: guessError } = await supabase
        .from('guesses')
        .insert({
          room_id: room.id,
          player_id: player.id,
          player_name: player.name,
          guess: guessValue,
          hint: hint,
        });

      if (guessError) throw guessError;

      if (isWin) {
        // Game over - player wins
        await supabase
          .from('game_rooms')
          .update({
            status: 'finished',
            winner_name: player.name,
            ended_at: new Date().toISOString(),
          })
          .eq('id', room.id);

        toast({
          title: '🎉 Victory!',
          description: 'You guessed the secret number!',
        });
      } else {
        // Switch turns
        const nextTurn = player.isPlayer1 ? room.player2_id : room.player1_id;
        await supabase
          .from('game_rooms')
          .update({ current_turn: nextTurn })
          .eq('id', room.id);
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to submit guess',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [room, player, toast]);

  // Leave room
  const leaveRoom = useCallback(() => {
    setRoom(null);
    setPlayer(null);
    setGuesses([]);
    setError(null);
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
