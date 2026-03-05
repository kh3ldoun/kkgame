import { Guess } from '@/types/game';
import { formatTime, getHintType } from '@/lib/gameUtils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, User } from 'lucide-react';

interface GuessHistoryProps { guesses: Guess[]; currentPlayerId: string | null; title: string; className?: string; }

const GuessHistory = ({ guesses, currentPlayerId, title, className }: GuessHistoryProps) => (
  <div className={`game-card flex flex-col h-full ${className || ''}`}>
    <div className="flex items-center gap-2 mb-4 shrink-0">
      <History className="w-5 h-5 text-primary" />
      <h3 className="font-semibold text-foreground">{title}</h3>
      <span className="ml-auto text-sm text-muted-foreground">{guesses.length} guesses</span>
    </div>
    {guesses.length === 0 ? (
      <div className="flex-1 flex items-center justify-center text-muted-foreground"><p>No guesses yet.</p></div>
    ) : (
      <ScrollArea className="flex-1 -mr-3 pr-3">
        <div className="space-y-2 pb-4">
          {guesses.slice().reverse().map((guess, index) => {
            const isMe = guess.player_id === currentPlayerId;
            const hintType = getHintType(guess.hint);
            return (
              <div key={guess.id}
                className={`p-3 rounded-lg border animate-slide-in ${isMe ? 'bg-primary/5 border-primary/20' : 'bg-secondary/5 border-secondary/20'}`}
                style={{ animationDelay: `${index * 50}ms` }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <User className={`w-4 h-4 ${isMe ? 'text-primary' : 'text-secondary'}`} />
                    <span className={`text-sm font-medium ${isMe ? 'text-primary' : 'text-secondary'}`}>
                      {isMe ? 'You' : guess.player_name}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">{formatTime(guess.created_at)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-mono font-bold tracking-widest text-foreground">{guess.guess}</span>
                  <span className={`hint-badge hint-${hintType}`}>{guess.hint}</span>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    )}
  </div>
);

export default GuessHistory;
