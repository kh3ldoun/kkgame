import { GameRoom as GameRoomType, Guess, Player } from '@/types/game';
import GameStatus from './GameStatus';
import SecretInput from './SecretInput';
import GuessInput from './GuessInput';
import GuessHistory from './GuessHistory';
import { HowToPlay } from './HowToPlay';
import { StatsPanel } from './StatsPanel';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface GameRoomProps {
  room: GameRoomType;
  guesses: Guess[];
  player: Player;
  loading: boolean;
  onSetSecret: (secret: string) => void;
  onMakeGuess: (guess: string) => void;
  onLeave: () => void;
}

const GameRoom = ({ room, guesses, player, loading, onSetSecret, onMakeGuess, onLeave }: GameRoomProps) => {
  const mySecret = player.isPlayer1 ? room.player1_secret : room.player2_secret;
  const hasOpponent = !!room.player2_id;
  const isMyTurn = room.current_turn === player.id;
  const gameOver = room.status === 'finished';
  const myGuesses = guesses.filter(g => g.player_id === player.id);
  const opponentGuesses = guesses.filter(g => g.player_id !== player.id);

  return (
    <div className="min-h-screen lg:h-screen p-4 pb-20 lg:pb-4 flex flex-col bg-background">
      <div className="max-w-7xl w-full mx-auto flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 shrink-0">
          <h1 className="text-2xl font-bold text-foreground text-glow-primary">Secret Numbers</h1>
          <div className="flex items-center gap-2">
            <HowToPlay />
            <StatsPanel />
            <Button variant="outline" size="sm" onClick={onLeave}
              className="border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive">
              <LogOut className="w-4 h-4 mr-2" /> Leave
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 flex-1 lg:min-h-0 overflow-y-auto lg:overflow-visible">
          {/* Left Column */}
          <div className="space-y-6 lg:overflow-y-auto lg:pr-2 scrollbar-thin">
            <GameStatus room={room} player={player} />
            {hasOpponent && !mySecret && (
              <SecretInput onSubmit={onSetSecret} loading={loading} hasSubmitted={false} />
            )}
            {mySecret && (
              <SecretInput onSubmit={onSetSecret} loading={loading} hasSubmitted={true} secretValue={mySecret} />
            )}
            {room.status === 'playing' && (
              <GuessInput onSubmit={onMakeGuess} loading={loading} disabled={gameOver} isMyTurn={isMyTurn} />
            )}
          </div>

          {/* Middle Column */}
          <div className="h-96 lg:h-auto lg:flex-1 min-h-0">
            <GuessHistory guesses={myGuesses} currentPlayerId={player.id} title="My Guesses" />
          </div>

          {/* Right Column */}
          <div className="h-96 lg:h-auto lg:flex-1 min-h-0">
            <GuessHistory guesses={opponentGuesses} currentPlayerId={player.id} title="Opponent's Guesses" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameRoom;
