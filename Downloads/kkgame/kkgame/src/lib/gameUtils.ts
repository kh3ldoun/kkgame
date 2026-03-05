export const generatePlayerId = (): string =>
  `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const isValidSecret = (value: string): boolean => /^\d{3}$/.test(value);

export const calculateHint = (guess: string, secret: string): string => {
  let correct = 0;
  for (let i = 0; i < 3; i++) {
    if (guess[i] === secret[i]) correct++;
  }
  if (correct === 3) return '🎉 You win! All digits correct!';
  if (correct === 2) return '⚠️ Two correct digits';
  if (correct === 1) return '⚠️ One correct digit';
  return '❌ No matching digits';
};

export const getHintType = (hint: string): 'none' | 'partial' | 'win' => {
  if (hint.includes('win')) return 'win';
  if (hint.includes('No matching')) return 'none';
  return 'partial';
};

export const formatTime = (timestamp: string): string =>
  new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

export const calculateDuration = (start: string | null, end: string | null): string => {
  if (!start) return '--:--';
  const diff = Math.floor(((end ? new Date(end).getTime() : Date.now()) - new Date(start).getTime()) / 1000);
  return `${Math.floor(diff / 60).toString().padStart(2, '0')}:${(diff % 60).toString().padStart(2, '0')}`;
};
