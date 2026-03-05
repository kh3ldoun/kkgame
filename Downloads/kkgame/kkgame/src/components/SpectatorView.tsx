import { GameRoom as GameRoomType, Guess, Player, Spectator } from '@/types/game';
import GuessHistory from '@/components/GuessHistory';
import { Button } from '@/components/ui/button';
import { Eye, LogOut, Users, Clock, Trophy, Loader2 } from 'lucide-react';
import { calculateDuration, formatTime } from '@/lib/gameUtils';
import { useEffect, useState } from 'react';

interface SpectatorViewProps {
  room: GameRoomType;
  guesses: Guess[];
  player: Player;
  spectators: Spectator[];
  onLeave: () => void;
}

const SpectatorView = ({ room, guesses, player, spectators, onLeave }: SpectatorViewProps) => {
  const [duration, setDuration] = useState('00:00');

  useEffect(() => {
    if (room.status !== 'playing') {
      setDuration(calculateDuration(room.started_at, room.ended_at));
      return;
    }
    const interval = setInterval(() => {
      setDuration(calculateDuration(room.started_at, null));
    }, 1000);
    return () => clearInterval(interval);
  }, [room.status, room.started_at, room.ended_at]);

  const p1Guesses = guesses.filter(g => g.player_id === room.player1_id);
  const p2Guesses = guesses.filter(g => g.player_id === room.player2_id);
  const currentTurnName = room.current_turn === room.player1_id ? room.player1_name : room.player2_name;

  return (
    <div className="min-h-screen p-4 pb-20 lg:pb-4 flex flex-col bg-background">
      <div className="max-w-7xl w-full mx-auto flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 border border-secondary/30">
              <Eye className="w-4 h-4 text-secondary animate-pulse" />
              <span className="text-sm font-semibold text-secondary">Spectating</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground text-glow-primary">
              Secret Numbers
            </h1>
          </div>
          <Button variant="outline" size="sm" onClick={onLeave}
            className="border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive">
            <LogOut className="w-4 h-4 mr-2" /> Leave
          </Button>
        </div>

        {/* Game info bar */}
        <div className="game-card mb-6 flex flex-wrap items-center gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Room</p>
            <p className="font-bold text-primary">{room.room_name}</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <span className={`status-badge ${
              room.status === 'playing' ? 'status-playing' :
              room.status === 'finished' ? 'status-finished' : 'status-waiting'
            }`}>{room.status}</span>
          </div>
          {room.status !== 'waiting' && (
            <>
              <div className="h-8 w-px bg-border" />
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent" />
                <span className="font-mono text-lg text-foreground">{duration}</span>
              </div>
            </>
          )}
          {room.status === 'playing' && (
            <>
              <div className="h-8 w-px bg-border" />
              <div>
                <p className="text-xs text-muted-foreground">Turn</p>
                <p className="font-semibold text-foreground">{currentTurnName}</p>
              </div>
            </>
          )}
          <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            {spectators.length + 1} watching
          </div>
        </div>

        {/* Winner banner */}
        {room.status === 'finished' && room.winner_name && (
          <div className="game-card mb-6 text-center animate-bounce-in">
            <Trophy className="w-10 h-10 text-accent mx-auto mb-2" />
            <p className="text-2xl font-bold text-accent">🎉 {room.winner_name} Wins!</p>
            <p className="text-muted-foreground mt-1 text-sm">Game over in {duration}</p>
          </div>
        )}

        {/* Guess histories */}
        <div className="grid lg:grid-cols-2 gap-6 flex-1">
          <div className="h-96 lg:h-auto">
            <GuessHistory
              guesses={p1Guesses}
              currentPlayerId={null}
              title={`${room.player1_name || 'Player 1'}'s Guesses`}
            />
          </div>
          <div className="h-96 lg:h-auto">
            <GuessHistory
              guesses={p2Guesses}
              currentPlayerId={null}
              title={`${room.player2_name || 'Player 2'}'s Guesses`}
            />
          </div>
        </div>

        {/* Spectator list */}
        {spectators.length > 0 && (
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Eye className="w-3 h-3" />
            <span>Also watching: {spectators.map(s => s.spectator_name).join(', ')}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpectatorView;
