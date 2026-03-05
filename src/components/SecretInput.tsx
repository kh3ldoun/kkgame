import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Lock, Eye, EyeOff } from 'lucide-react';

interface SecretInputProps { onSubmit: (secret: string) => void; loading: boolean; hasSubmitted: boolean; secretValue?: string | null; }

const SecretInput = ({ onSubmit, loading, hasSubmitted, secretValue }: SecretInputProps) => {
  const [digits, setDigits] = useState(['', '', '']);
  const [showDigits, setShowDigits] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const inputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  useEffect(() => { if (!hasSubmitted) inputRefs[0].current?.focus(); }, [hasSubmitted]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newDigits = [...digits]; newDigits[index] = value; setDigits(newDigits);
    if (value && index < 2) inputRefs[index + 1].current?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) inputRefs[index - 1].current?.focus();
  };

  const handleSubmit = () => { const secret = digits.join(''); if (secret.length === 3) onSubmit(secret); };
  const isComplete = digits.every(d => d !== '');

  if (hasSubmitted) {
    return (
      <div className="game-card text-center animate-bounce-in">
        <div className="flex items-center justify-center gap-2 text-success mb-2">
          <Lock className="w-5 h-5" /><span className="font-semibold">Secret Locked!</span>
        </div>
        <div className="flex items-center justify-center gap-3 my-4">
          <span className="font-mono text-2xl font-bold tracking-widest">{showSecret && secretValue ? secretValue : '***'}</span>
          <button onClick={() => setShowSecret(!showSecret)} className="text-muted-foreground hover:text-foreground transition-colors p-1">
            {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-muted-foreground text-sm">Your secret number has been saved securely.</p>
      </div>
    );
  }

  return (
    <div className="game-card animate-scale-in">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-1">Choose Your Secret Number</h3>
        <p className="text-sm text-muted-foreground">Pick any 3-digit number. Your opponent will try to guess it!</p>
      </div>
      <div className="flex justify-center gap-3 mb-6">
        {digits.map((digit, index) => (
          <input key={index} ref={inputRefs[index]} type={showDigits ? 'text' : 'password'}
            inputMode="numeric" maxLength={1} value={digit}
            onChange={e => handleChange(index, e.target.value)}
            onKeyDown={e => handleKeyDown(index, e)}
            className="digit-input" disabled={loading} />
        ))}
      </div>
      <div className="flex items-center justify-center gap-4 mb-6">
        <button type="button" onClick={() => setShowDigits(!showDigits)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          {showDigits ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showDigits ? 'Hide' : 'Show'} digits
        </button>
      </div>
      <Button onClick={handleSubmit} disabled={!isComplete || loading}
        className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 glow-secondary">
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-secondary-foreground/30 border-t-secondary-foreground rounded-full animate-spin" />
            Saving...
          </span>
        ) : <><Lock className="w-4 h-4 mr-2" />Lock In Secret</>}
      </Button>
    </div>
  );
};

export default SecretInput;
