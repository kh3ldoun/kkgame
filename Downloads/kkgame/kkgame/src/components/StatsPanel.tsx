import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PlayerStats, MatchHistory } from '@/types/game';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BarChart2, Trophy, Clock, Swords, Star, Target } from 'lucide-react';

const formatDuration = (secs: number | null) => {
  if (!secs) return '--:--';
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const formatDate = (iso: string) => {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

export const StatsPanel = () => {
  const [stats, setStats] = useState<PlayerStats[]>([]);
  const [history, setHistory] = useState<MatchHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [{ data: s }, { data: h }] = await Promise.all([
      supabase.from('player_stats').select('*').order('wins', { ascending: false }).limit(20),
      supabase.from('match_history').select('*').order('created_at', { ascending: false }).limit(30),
    ]);
    setStats((s as PlayerStats[]) || []);
    setHistory((h as MatchHistory[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (open) fetchData();
  }, [open]);

  const winRate = (s: PlayerStats) =>
    s.total_games > 0 ? Math.round((s.wins / s.total_games) * 100) : 0;

  const avgGuesses = (s: PlayerStats) =>
    s.wins > 0 ? (s.total_guesses / s.wins).toFixed(1) : '—';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm"
          className="border-border hover:bg-accent/10 hover:text-accent hover:border-accent/50 gap-2">
          <BarChart2 className="w-4 h-4" />
          Stats
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg border-border p-0 overflow-hidden"
        style={{ background: 'linear-gradient(145deg, hsl(222 47% 12%), hsl(222 47% 8%))' }}>
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-foreground flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-accent" />
            Stats & Match History
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="leaderboard" className="px-6 pb-6">
          <TabsList className="mb-4 bg-muted w-full">
            <TabsTrigger value="leaderboard" className="flex-1 gap-1.5">
              <Trophy className="w-3.5 h-3.5" /> Leaderboard
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1 gap-1.5">
              <Clock className="w-3.5 h-3.5" /> History
            </TabsTrigger>
          </TabsList>

          {/* ── LEADERBOARD ── */}
          <TabsContent value="leaderboard">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground text-sm">Loading...</div>
            ) : stats.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No stats yet — play a game to get started!
              </div>
            ) : (
              <ScrollArea className="h-80">
                <div className="space-y-2 pr-2">
                  {stats.map((s, i) => (
                    <div key={s.id}
                      className={`p-3 rounded-lg border transition-all ${
                        i === 0 ? 'border-accent/40 bg-accent/5' :
                        i === 1 ? 'border-muted-foreground/30 bg-muted/30' :
                        i === 2 ? 'border-secondary/30 bg-secondary/5' :
                        'border-border bg-muted/10'
                      }`}>
                      <div className="flex items-center gap-3">
                        <span className={`text-lg font-bold w-7 text-center ${
                          i === 0 ? 'text-accent' : i === 1 ? 'text-muted-foreground' : i === 2 ? 'text-secondary' : 'text-muted-foreground'
                        }`}>
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">{s.player_name}</p>
                          <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Trophy className="w-3 h-3 text-accent" /> {s.wins}W {s.losses}L
                            </span>
                            <span className="flex items-center gap-1">
                              <Target className="w-3 h-3 text-primary" /> {winRate(s)}% win
                            </span>
                            {s.best_guesses && (
                              <span className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-secondary" /> Best: {s.best_guesses}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-lg font-bold text-foreground font-mono">{s.wins}</p>
                          <p className="text-xs text-muted-foreground">wins</p>
                        </div>
                      </div>
                      {/* Win rate bar */}
                      <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${winRate(s)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          {/* ── MATCH HISTORY ── */}
          <TabsContent value="history">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground text-sm">Loading...</div>
            ) : history.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No matches yet — play a game!
              </div>
            ) : (
              <ScrollArea className="h-80">
                <div className="space-y-2 pr-2">
                  {history.map((m) => (
                    <div key={m.id}
                      className="p-3 rounded-lg border border-border bg-muted/10 hover:bg-muted/20 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono text-muted-foreground">#{m.room_name}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {formatDate(m.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className={`font-semibold truncate ${m.winner_name === m.player1_name ? 'text-primary' : 'text-foreground'}`}>
                          {m.player1_name || '?'}
                        </span>
                        <Swords className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className={`font-semibold truncate ${m.winner_name === m.player2_name ? 'text-primary' : 'text-foreground'}`}>
                          {m.player2_name || '?'}
                        </span>
                        <span className="ml-auto shrink-0 text-xs text-muted-foreground font-mono">
                          {formatDuration(m.duration_seconds)}
                        </span>
                      </div>
                      <div className="mt-1.5 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {m.player1_guesses} vs {m.player2_guesses} guesses
                        </span>
                        {m.winner_name && (
                          <span className="text-xs font-semibold text-accent flex items-center gap-1">
                            <Trophy className="w-3 h-3" /> {m.winner_name}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default StatsPanel;
