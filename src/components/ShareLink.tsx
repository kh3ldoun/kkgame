import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShareLinkProps {
  roomName: string;
}

const ShareLink = ({ roomName }: ShareLinkProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const shareUrl = `${window.location.origin}?room=${encodeURIComponent(roomName)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: 'Link copied!',
        description: 'Share this link with your friend to join the game.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: 'Failed to copy',
        description: 'Please copy the link manually.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-4 bg-muted/50 rounded-lg border border-border">
      <div className="flex items-center gap-2 mb-2">
        <Share2 className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-foreground">Invite a Friend</span>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={shareUrl}
          readOnly
          className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-lg text-muted-foreground font-mono truncate"
        />
        <Button
          onClick={handleCopy}
          variant="outline"
          size="sm"
          className={`shrink-0 transition-all ${copied ? 'border-success text-success' : 'border-primary text-primary hover:bg-primary/10'}`}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-1" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-1" />
              Copy
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ShareLink;
