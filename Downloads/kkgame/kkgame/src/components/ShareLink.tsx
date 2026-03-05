import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, Share2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShareLinkProps {
  roomName: string;
}

const ShareLink = ({ roomName }: ShareLinkProps) => {
  const [copiedPlay, setCopiedPlay] = useState(false);
  const [copiedWatch, setCopiedWatch] = useState(false);
  const { toast } = useToast();

  const playUrl = `${window.location.origin}?room=${encodeURIComponent(roomName)}`;
  const watchUrl = `${window.location.origin}?room=${encodeURIComponent(roomName)}&spectate=1`;

  const copyLink = async (url: string, type: 'play' | 'watch') => {
    try {
      await navigator.clipboard.writeText(url);
      if (type === 'play') { setCopiedPlay(true); setTimeout(() => setCopiedPlay(false), 2000); }
      else { setCopiedWatch(true); setTimeout(() => setCopiedWatch(false), 2000); }
      toast({
        title: type === 'play' ? '🎮 Play link copied!' : '👁️ Watch link copied!',
        description: type === 'play'
          ? 'Share with your opponent to join the game.'
          : 'Share with friends to let them watch live.',
      });
    } catch {
      toast({ title: 'Failed to copy', variant: 'destructive' });
    }
  };

  return (
    <div className="p-4 bg-muted/50 rounded-lg border border-border space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Share2 className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-foreground">Invite</span>
      </div>

      {/* Play link */}
      <div>
        <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
          🎮 Opponent link
        </p>
        <div className="flex gap-2">
          <input type="text" value={playUrl} readOnly
            className="flex-1 px-3 py-2 text-xs bg-background border border-border rounded-lg text-muted-foreground font-mono truncate" />
          <Button onClick={() => copyLink(playUrl, 'play')} variant="outline" size="sm"
            className={`shrink-0 transition-all ${copiedPlay ? 'border-success text-success' : 'border-primary text-primary hover:bg-primary/10'}`}>
            {copiedPlay ? <><Check className="w-3.5 h-3.5 mr-1" />Copied</> : <><Copy className="w-3.5 h-3.5 mr-1" />Copy</>}
          </Button>
        </div>
      </div>

      {/* Spectate link */}
      <div>
        <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
          <Eye className="w-3 h-3" /> Watch link
        </p>
        <div className="flex gap-2">
          <input type="text" value={watchUrl} readOnly
            className="flex-1 px-3 py-2 text-xs bg-background border border-border rounded-lg text-muted-foreground font-mono truncate" />
          <Button onClick={() => copyLink(watchUrl, 'watch')} variant="outline" size="sm"
            className={`shrink-0 transition-all ${copiedWatch ? 'border-success text-success' : 'border-secondary text-secondary hover:bg-secondary/10'}`}>
            {copiedWatch ? <><Check className="w-3.5 h-3.5 mr-1" />Copied</> : <><Copy className="w-3.5 h-3.5 mr-1" />Copy</>}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShareLink;
