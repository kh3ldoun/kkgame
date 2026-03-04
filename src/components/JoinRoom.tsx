import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Gamepad2, Users, Lock, CheckCircle2 } from 'lucide-react';

interface JoinRoomProps {
  onJoin: (roomName: string, playerName: string) => void;
  loading: boolean;
}

// Get room name from URL if present
const getRoomFromUrl = (): string => {
  const params = new URLSearchParams(window.location.search);
  return params.get('room') || '';
};

const JoinRoom = ({ onJoin, loading }: JoinRoomProps) => {
  const [roomName, setRoomName] = useState(getRoomFromUrl());
  const [playerName, setPlayerName] = useState('');
  const [hasInvite, setHasInvite] = useState(false);

  useEffect(() => {
    const roomFromUrl = getRoomFromUrl();
    if (roomFromUrl) {
      setRoomName(roomFromUrl);
      setHasInvite(true);
    }
  }, []);
  const [errors, setErrors] = useState({ room: '', player: '' });

  const validate = () => {
    const newErrors = { room: '', player: '' };
    
    if (roomName.trim().length < 3) {
      newErrors.room = 'Room name must be at least 3 characters';
    }
    
    if (playerName.trim().length < 1) {
      newErrors.player = 'Please enter your display name';
    }
    
    setErrors(newErrors);
    return !newErrors.room && !newErrors.player;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
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
          <h1 className="text-4xl font-bold text-foreground text-glow-primary">
            Secret Numbers
          </h1>
          <p className="text-muted-foreground mt-2">
            {hasInvite ? "You've been invited to a game!" : 'A two-player guessing game'}
          </p>
        </div>

        {/* Join Form */}
        <form onSubmit={handleSubmit} className="game-card animate-slide-in">
          <div className="space-y-6">
            {/* Room Name */}
            <div className="space-y-2">
              <Label htmlFor="roomName" className="flex items-center gap-2 text-foreground">
                <Lock className="w-4 h-4 text-primary" />
                Room Name
              </Label>
              <Input
                id="roomName"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Enter room name..."
                className="bg-muted border-border focus:border-primary"
                disabled={loading}
              />
              {errors.room && (
                <p className="text-sm text-destructive">{errors.room}</p>
              )}
            </div>

            {/* Player Name */}
            <div className="space-y-2">
              <Label htmlFor="playerName" className="flex items-center gap-2 text-foreground">
                <Users className="w-4 h-4 text-secondary" />
                Your Display Name
              </Label>
              <Input
                id="playerName"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name..."
                className="bg-muted border-border focus:border-primary"
                disabled={loading}
              />
              {errors.player && (
                <p className="text-sm text-destructive">{errors.player}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-primary"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Joining...
                </span>
              ) : (
                'Join or Create Room'
              )}
            </Button>
          </div>
        </form>

        {/* Rules */}
        <div className="mt-6 game-card animate-fade-in space-y-3">
          <h2 className="text-sm font-semibold text-foreground">كيف تلعب؟ / How to play</h2>
          <ul className="space-y-2 text-sm text-muted-foreground text-left">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary shrink-0" />
              اختر رقمًا سريًا من 3 خانات بعد دخول الغرفة.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary shrink-0" />
              في كل محاولة، ادخل رقمًا من 3 خانات لتخمين رقم خصمك.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary shrink-0" />
              استعمل سجل المحاولات لمراجعة التخمينات السابقة وتحسين خطتك.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default JoinRoom;
