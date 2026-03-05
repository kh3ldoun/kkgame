import { GameRoom, Player } from '@/types/game';
import { calculateDuration, formatTime } from '@/lib/gameUtils';
import { Users, Clock, Trophy, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import ShareLink from './ShareLink';

interface GameStatusProps { room: GameRoom; player: Player; }

const GameStatus = ({ room, player }: GameStatusProps) => {
  const [duration, setDuration] = useState('00:00');

  useEffect(() => {
    if (room.status !== 'playing') { setDuration(calculateDuration(room.started_at, room.ended_at)); return; }
    const interval = setInterval(() => setDuration(calculateDuration(room.started_at, null)), 1000);
    return () => clearInterval(interval);
  }, [room.status, room.started_at, room.ended_at]);

  const getStatusBadge = () => {
    switch (room.status) {
      case 'waiting': return <span className="status-badge status-waiting">Waiting</span>;
      case 'playing': return <span className="status-badge status-playing">Playing</span>;
      case 'finished': return <span className="status-badge status-finished">Finished</span>;
    }
  };

  const mySecret = player.isPlayer1 ? room.player1_secret : room.player2_secret;

  return (
    <div className="game-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Room: <span className="text-primary">{room.room_name}</span></h2>
          <p className="text-sm text-muted-foreground">Created {formatTime(room.created_at)}</p>
        </div>
        {getStatusBadge()}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className={`p-3 rounded-lg border ${player.isPlayer1 ? 'bg-primary/10 border-primary/30' : 'bg-muted border-border'}`}>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground truncate">{room.player1_name || 'Waiting...'}</span>
          </div>
          <div className="text-xs text-muted-foreground">{player.isPlayer1 ? '(You)' : 'Opponent'}</div>
          <div className="mt-2 text-xs">Secret: {player.isPlayer1 ? (mySecret ? '✅ Set' : '⏳ Not set') : (room.player1_secret ? '✅ Set' : '⏳ Not set')}</div>
        </div>

        <div className={`p-3 rounded-lg border ${!player.isPlayer1 ? 'bg-secondary/10 border-secondary/30' : 'bg-muted border-border'}`}>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-foreground truncate">{room.player2_name || 'Waiting...'}</span>
          </div>
          <div className="text-xs text-muted-foreground">{!player.isPlayer1 ? '(You)' : room.player2_name ? 'Opponent' : 'Not joined'}</div>
          <div className="mt-2 text-xs">Secret: {!player.isPlayer1 ? (mySecret ? '✅ Set' : '⏳ Not set') : (room.player2_secret ? '✅ Set' : '⏳ Not set')}</div>
        </div>
      </div>

      {room.status !== 'waiting' && (
        <div className="flex items-center justify-center gap-2 py-2 border-t border-border">
          <Clock className="w-4 h-4 text-accent" />
          <span className="font-mono text-lg text-foreground">{duration}</span>
        </div>
      )}

      {room.status === 'finished' && room.winner_name && (
        <div className="mt-4 p-4 bg-accent/20 rounded-lg text-center animate-bounce-in">
          <Trophy className="w-8 h-8 text-accent mx-auto mb-2" />
          <p className="text-lg font-bold text-accent">
            {room.winner_name === player.name ? '🎉 You Won!' : `${room.winner_name} Wins!`}
          </p>
        </div>
      )}

      {room.status === 'waiting' && !room.player2_id && (
        <div className="mt-4 space-y-4">
          <ShareLink roomName={room.room_name} />
          <div className="p-4 bg-muted rounded-lg text-center">
            <Loader2 className="w-6 h-6 text-primary mx-auto mb-2 animate-spin" />
            <p className="text-sm text-muted-foreground">Waiting for opponent to join...</p>
          </div>
        </div>
      )}

      {room.status === 'waiting' && room.player2_id && (!room.player1_secret || !room.player2_secret) && (
        <div className="mt-4 p-4 bg-muted rounded-lg text-center">
          <Loader2 className="w-6 h-6 text-secondary mx-auto mb-2 animate-spin" />
          <p className="text-sm text-muted-foreground">Waiting for both players to set their secrets...</p>
        </div>
      )}
    </div>
  );
};

export default GameStatus;
