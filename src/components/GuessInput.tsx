import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

interface GuessInputProps {
  onSubmit: (guess: string) => void;
  loading: boolean;
  disabled: boolean;
  isMyTurn: boolean;
}

const GuessInput = ({ onSubmit, loading, disabled, isMyTurn }: GuessInputProps) => {
  const [digits, setDigits] = useState(['', '', '']);
  const inputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  useEffect(() => {
    if (isMyTurn && !disabled) {
      inputRefs[0].current?.focus();
    }
  }, [isMyTurn, disabled]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);

    if (value && index < 2) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
    if (e.key === 'Enter' && isComplete) {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const guess = digits.join('');
    if (guess.length === 3) {
      onSubmit(guess);
      setDigits(['', '', '']);
      inputRefs[0].current?.focus();
    }
  };

  const isComplete = digits.every((d) => d !== '');

  return (
    <div className={`game-card transition-all duration-300 ${isMyTurn ? 'ring-2 ring-primary pulse-glow' : 'opacity-60'}`}>
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          {isMyTurn ? "Your Turn - Make a Guess!" : "Waiting for opponent..."}
        </h3>
      </div>

      <div className="flex justify-center gap-3 mb-4">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={inputRefs[index]}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="digit-input"
            disabled={disabled || loading || !isMyTurn}
          />
        ))}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!isComplete || disabled || loading || !isMyTurn}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Submitting...
          </span>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Submit Guess
          </>
        )}
      </Button>
    </div>
  );
};

export default GuessInput;
