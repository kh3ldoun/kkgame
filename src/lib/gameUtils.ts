// Generate a unique player ID
export const generatePlayerId = (): string => {
  return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Validate a 3-digit number
export const isValidSecret = (value: string): boolean => {
  return /^\d{3}$/.test(value);
};

// Calculate hint based ONLY on exact position match
export const calculateHint = (guess: string, secret: string): string => {
  let correct = 0;

  for (let i = 0; i < 3; i++) {
    if (guess[i] === secret[i]) {
      correct++;
    }
  }

  if (correct === 0) {
    return '❌ No matching digits';
  }

  if (correct === 1) {
    return '⚠️ One correct digit';
  }

  if (correct === 2) {
    return '⚠️ Two correct digits';
  }

  return '🎉 You win! All digits correct!';
};

// Get hint type for styling
export const getHintType = (hint: string): 'none' | 'partial' | 'win' => {
  if (hint.includes('win')) return 'win';
  if (hint.includes('No matching')) return 'none';
  return 'partial';
};

// Format timestamp
export const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

// Calculate game duration
export const calculateDuration = (
  start: string | null,
  end: string | null
): string => {
  if (!start) return '--:--';

  const startTime = new Date(start).getTime();
  const endTime = end ? new Date(end).getTime() : Date.now();
  const diff = Math.floor((endTime - startTime) / 1000);

  const minutes = Math.floor(diff / 60);
  const seconds = diff % 60;

  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;
};