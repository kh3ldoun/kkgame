import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HelpCircle, Lock, Target, Zap, Trophy, ChevronRight } from 'lucide-react';

const steps = [
  {
    icon: Lock,
    color: 'text-secondary',
    glow: 'glow-secondary',
    border: 'border-secondary/30',
    bg: 'bg-secondary/10',
    title: 'Pick a Secret Number',
    desc: 'Choose any 3-digit number (e.g. 472). Your opponent cannot see it — keep it secret!',
    example: null,
  },
  {
    icon: Target,
    color: 'text-primary',
    glow: 'glow-primary',
    border: 'border-primary/30',
    bg: 'bg-primary/10',
    title: 'Take Turns Guessing',
    desc: 'Players alternate guessing the opponent\'s secret 3-digit number. Enter your guess digit by digit.',
    example: null,
  },
  {
    icon: Zap,
    color: 'text-accent',
    glow: 'glow-accent',
    border: 'border-accent/30',
    bg: 'bg-accent/10',
    title: 'Read the Hints',
    desc: 'After each guess you get a hint based on how many digits are in the correct position.',
    example: 'hints',
  },
  {
    icon: Trophy,
    color: 'text-primary',
    glow: 'glow-primary',
    border: 'border-primary/30',
    bg: 'bg-primary/10',
    title: 'Win the Game',
    desc: 'First player to guess all 3 digits in the correct position wins! 🎉',
    example: null,
  },
];

const hints = [
  { icon: '❌', label: 'No matching digits', type: 'none', desc: 'None of your digits are in the right position.' },
  { icon: '⚠️', label: 'One correct digit', type: 'partial', desc: 'Exactly 1 digit is in the correct position.' },
  { icon: '⚠️', label: 'Two correct digits', type: 'partial', desc: 'Exactly 2 digits are in the correct position.' },
  { icon: '🎉', label: 'You win!', type: 'win', desc: 'All 3 digits are correct and in the right position!' },
];

const hintStyle: Record<string, string> = {
  none: 'bg-destructive/20 text-destructive border border-destructive/20',
  partial: 'bg-warning/20 text-warning border border-warning/20',
  win: 'bg-success/20 text-success border border-success/20',
};

export const HowToPlay = () => {
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(false);

  const current = steps[step];
  const Icon = current.icon;
  const isLast = step === steps.length - 1;

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setStep(0); }}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-border hover:bg-primary/10 hover:text-primary hover:border-primary/50 gap-2"
        >
          <HelpCircle className="w-4 h-4" />
          How to Play
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md border-border bg-card p-0 overflow-hidden"
        style={{ background: 'linear-gradient(145deg, hsl(222 47% 12%), hsl(222 47% 8%))' }}>

        {/* Progress bar */}
        <div className="flex gap-1 p-4 pb-0">
          {steps.map((_, i) => (
            <div
              key={i}
              onClick={() => setStep(i)}
              className={`h-1 flex-1 rounded-full cursor-pointer transition-all duration-300 ${
                i <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <DialogHeader className="px-6 pt-4 pb-2">
          <DialogTitle className="text-foreground flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            How to Play — Secret Numbers
          </DialogTitle>
        </DialogHeader>

        {/* Step content */}
        <div className="px-6 pb-6">
          <div className={`rounded-xl border ${current.border} ${current.bg} p-5 mb-5 transition-all duration-300`}>
            <div className="flex items-start gap-4">
              <div className={`p-2.5 rounded-lg ${current.bg} border ${current.border} shrink-0`}>
                <Icon className={`w-6 h-6 ${current.color}`} />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                  Step {step + 1} of {steps.length}
                </p>
                <h3 className="text-lg font-bold text-foreground mb-2">{current.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{current.desc}</p>
              </div>
            </div>

            {/* Hints example */}
            {current.example === 'hints' && (
              <div className="mt-4 space-y-2">
                {hints.map((h) => (
                  <div key={h.label} className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-md shrink-0 ${hintStyle[h.type]}`}>
                      {h.icon} {h.label}
                    </span>
                    <span className="text-xs text-muted-foreground">{h.desc}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Example for step 1 */}
          {step === 0 && (
            <div className="mb-5 flex justify-center gap-3">
              {['4', '7', '2'].map((d, i) => (
                <div
                  key={i}
                  className="w-14 h-16 rounded-lg border-2 border-secondary/50 bg-secondary/10 flex items-center justify-center text-2xl font-mono font-bold text-secondary"
                  style={{ boxShadow: '0 0 12px hsl(280 100% 65% / 0.3)' }}
                >
                  {d}
                </div>
              ))}
            </div>
          )}

          {/* Example for step 4 (win) */}
          {step === 3 && (
            <div className="mb-5 flex items-center justify-center gap-3">
              {['5', '8', '1'].map((d, i) => (
                <div
                  key={i}
                  className="w-14 h-16 rounded-lg border-2 border-success/50 bg-success/10 flex items-center justify-center text-2xl font-mono font-bold text-success"
                  style={{ boxShadow: '0 0 12px hsl(142 76% 45% / 0.3)' }}
                >
                  {d}
                </div>
              ))}
              <span className="text-2xl ml-2">🎉</span>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3">
            {step > 0 && (
              <Button
                variant="outline"
                className="flex-1 border-border"
                onClick={() => setStep(step - 1)}
              >
                Back
              </Button>
            )}
            <Button
              className={`flex-1 gap-2 ${isLast ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-muted hover:bg-muted/80 text-foreground'}`}
              style={isLast ? { boxShadow: '0 0 20px hsl(174 100% 50% / 0.4)' } : {}}
              onClick={() => {
                if (isLast) setOpen(false);
                else setStep(step + 1);
              }}
            >
              {isLast ? 'Let\'s Play!' : <>Next <ChevronRight className="w-4 h-4" /></>}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HowToPlay;
