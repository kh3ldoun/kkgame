import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Gamepad2, Users, Lock } from 'lucide-react';

type Language = 'en' | 'ar';

const content: Record<Language, {
  title: string;
  subtitle: string;
  invitedSubtitle: string;
  roomName: string;
  roomPlaceholder: string;
  playerName: string;
  playerPlaceholder: string;
  join: string;
  joining: string;
  roomError: string;
  playerError: string;
  introTitle: string;
  introDescription: string;
  howToPlayTitle: string;
  howToPlay: string[];
  credit: string;
}> = {
  en: {
    title: 'Secret Numbers',
    subtitle: 'A two-player guessing game',
    invitedSubtitle: "You've been invited to a game!",
    roomName: 'Room Name',
    roomPlaceholder: 'Enter room name...',
    playerName: 'Your Display Name',
    playerPlaceholder: 'Enter your name...',
    join: 'Join or Create Room',
    joining: 'Joining...',
    roomError: 'Room name must be at least 3 characters',
    playerError: 'Please enter your display name',
    introTitle: 'Game Introduction',
    introDescription: 'Challenge your friend in a smart number guessing battle.',
    howToPlayTitle: 'How to Play',
    howToPlay: [
      'Each player chooses a secret 3-digit number.',
      'Take turns guessing your opponent\'s number.',
      'Use the clues each round to improve your next guess.',
    ],
    credit: 'Game by Khaldoun with AI assistance.',
  },
  ar: {
    title: 'الأرقام السرّية',
    subtitle: 'لعبة تخمين بين لاعبين',
    invitedSubtitle: 'تمت دعوتك إلى لعبة!',
    roomName: 'اسم الغرفة',
    roomPlaceholder: 'اكتب اسم الغرفة...',
    playerName: 'اسم اللاعب',
    playerPlaceholder: 'اكتب اسمك...',
    join: 'انضم أو أنشئ غرفة',
    joining: 'جاري الانضمام...',
    roomError: 'اسم الغرفة يجب أن يكون 3 أحرف على الأقل',
    playerError: 'يرجى إدخال اسم اللاعب',
    introTitle: 'تعريف اللعبة',
    introDescription: 'تحدَّ صديقك في منافسة ذكية لتخمين الرقم.',
    howToPlayTitle: 'كيفية اللعب',
    howToPlay: [
      'كل لاعب يختار رقمًا سريًا من 3 خانات.',
      'تبادلوا الأدوار لتخمين رقم الخصم.',
      'استخدم التلميحات في كل جولة لتحسين التخمين التالي.',
    ],
    credit: 'اللعبة من تطوير خلدون بمساعدة الذكاء الاصطناعي.',
  },
};

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
  const [language, setLanguage] = useState<Language>('ar');

  useEffect(() => {
    const roomFromUrl = getRoomFromUrl();
    if (roomFromUrl) {
      setRoomName(roomFromUrl);
      setHasInvite(true);
    }
  }, []);
  const [errors, setErrors] = useState({ room: '', player: '' });
  const t = content[language];
  const isArabic = language === 'ar';

  const validate = () => {
    const newErrors = { room: '', player: '' };
    
    if (roomName.trim().length < 3) {
      newErrors.room = t.roomError;
    }
    
    if (playerName.trim().length < 1) {
      newErrors.player = t.playerError;
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
    <div className="min-h-screen flex items-center justify-center p-4" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-md">
        <div className="mb-4 flex items-center justify-center gap-2">
          <Button
            type="button"
            variant={language === 'ar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLanguage('ar')}
          >
            العربية
          </Button>
          <Button
            type="button"
            variant={language === 'en' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLanguage('en')}
          >
            English
          </Button>
        </div>

        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 border border-primary/30 mb-4 glow-primary float-animation">
            <Gamepad2 className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground text-glow-primary">
            {t.title}
          </h1>
          <p className="text-muted-foreground mt-2">
            {hasInvite ? t.invitedSubtitle : t.subtitle}
          </p>
        </div>

        <div className="game-card mb-6 animate-fade-in">
          <h2 className="text-lg font-semibold text-foreground mb-2">{t.introTitle}</h2>
          <p className="text-sm text-muted-foreground mb-3">{t.introDescription}</p>
          <h3 className="font-medium text-foreground mb-2">{t.howToPlayTitle}</h3>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            {t.howToPlay.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </div>

        {/* Join Form */}
        <form onSubmit={handleSubmit} className="game-card animate-slide-in">
          <div className="space-y-6">
            {/* Room Name */}
            <div className="space-y-2">
              <Label htmlFor="roomName" className="flex items-center gap-2 text-foreground">
                <Lock className="w-4 h-4 text-primary" />
                {t.roomName}
              </Label>
              <Input
                id="roomName"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder={t.roomPlaceholder}
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
                {t.playerName}
              </Label>
              <Input
                id="playerName"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder={t.playerPlaceholder}
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
                  {t.joining}
                </span>
              ) : (
                t.join
              )}
            </Button>
          </div>
        </form>

        {/* Rules */}
        <div className="mt-6 text-center text-sm text-muted-foreground animate-fade-in">
          <p>{t.howToPlay[0]}</p>
          <p>{t.howToPlay[1]}</p>
          <p className="mt-2 text-xs">{t.credit}</p>
        </div>
      </div>
    </div>
  );
};

export default JoinRoom;
