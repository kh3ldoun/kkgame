import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Gamepad2, Users, Lock, Eye } from 'lucide-react';
import { StatsPanel } from '@/components/StatsPanel';

interface JoinRoomProps {
  onJoin: (roomName: string, playerName: string) => void;
  onSpectate: (roomName: string, spectatorName: string) => void;
  loading: boolean;
}

const getRoomFromUrl = (): string => {
  const params = new URLSearchParams(window.location.search);
  return params.get('room') || '';
};

const getSpectateFromUrl = (): boolean => {
  const params = new URLSearchParams(window.location.search);
  return params.get('spectate') === '1';
};

const JoinRoom = ({ onJoin, onSpectate, loading }: JoinRoomProps) => {
  const [roomName, setRoomName] = useState(getRoomFromUrl());
  const [playerName, setPlayerName] = useState('');
  const [hasInvite, setHasInvite] = useState(false);
  const [isSpectateMode, setIsSpectateMode] = useState(getSpectateFromUrl());
  const [errors, setErrors] = useState({ room: '', player: '' });

  useEffect(() => {
    const roomFromUrl = getRoomFromUrl();
    if (roomFromUrl) { setRoomName(roomFromUrl); setHasInvite(true); }
    if (getSpectateFromUrl()) setIsSpectateMode(true);
  }, []);

  const validate = () => {
    const newErrors = { room: '', player: '' };
    if (roomName.trim().length < 3) newErrors.room = 'Room name must be at least 3 characters';
    if (playerName.trim().length < 1) newErrors.player = 'Please enter your display name';
    setErrors(newErrors);
    return !newErrors.room && !newErrors.player;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (isSpectateMode) {
      onSpectate(roomName.trim().toLowerCase(), playerName.trim());
    } else {
      onJoin(roomName.trim().toLowerCase(), playerName.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 border border-primary/30 mb-4 glow-primary float-animation">
            <Gamepad2 className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground text-glow-primary">Secret Numbers</h1>
          <p className="text-muted-foreground mt-2">
            {hasInvite && !isSpectateMode ? "You've been invited to a game!" :
             isSpectateMode ? '👁️ Watch a game live' :
             'A two-player guessing game'}
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-4 p-1 bg-muted rounded-xl">
          <button
            onClick={() => setIsSpectateMode(false)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
              !isSpectateMode ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Gamepad2 className="w-4 h-4" /> Play
          </button>
          <button
            onClick={() => setIsSpectateMode(true)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
              isSpectateMode ? 'bg-secondary text-secondary-foreground shadow' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Eye className="w-4 h-4" /> Spectate
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="game-card animate-slide-in">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="roomName" className="flex items-center gap-2 text-foreground">
                <Lock className="w-4 h-4 text-primary" /> Room Name
              </Label>
              <Input id="roomName" value={roomName} onChange={e => setRoomName(e.target.value)}
                placeholder="Enter room name..." className="bg-muted border-border focus:border-primary" disabled={loading} />
              {errors.room && <p className="text-sm text-destructive">{errors.room}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="playerName" className="flex items-center gap-2 text-foreground">
                <Users className="w-4 h-4 text-secondary" />
                {isSpectateMode ? 'Your Name (viewer)' : 'Your Display Name'}
              </Label>
              <Input id="playerName" value={playerName} onChange={e => setPlayerName(e.target.value)}
                placeholder={isSpectateMode ? 'Enter your name to watch...' : 'Enter your name...'}
                className="bg-muted border-border focus:border-primary" disabled={loading} />
              {errors.player && <p className="text-sm text-destructive">{errors.player}</p>}
            </div>

            <Button type="submit"
              className={`w-full ${isSpectateMode
                ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90 glow-secondary'
                : 'bg-primary text-primary-foreground hover:bg-primary/90 glow-primary'
              }`}
              disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                  {isSpectateMode ? 'Joining as spectator...' : 'Joining...'}
                </span>
              ) : isSpectateMode ? (
                <><Eye className="w-4 h-4 mr-2" /> Watch Game</>
              ) : (
                'Join or Create Room'
              )}
            </Button>
          </div>
        </form>

        {/* Rules + Stats button */}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {isSpectateMode
              ? 'Watch live without playing.'
              : 'Each player picks a secret 3-digit number. Take turns guessing!'}
          </p>
          <StatsPanel />
        </div>
      </div>
    </div>
  );
};

export default JoinRoom;
