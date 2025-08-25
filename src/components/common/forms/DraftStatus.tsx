import { SaveStatus } from '@/hooks/useServerOrderDraft';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, Check, AlertCircle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DraftStatusProps {
  saveStatus: SaveStatus;
  lastSaved: Date | null;
  onDiscardDraft?: () => void;
  onSaveNow?: () => void;
  className?: string;
}

export function DraftStatus({ 
  saveStatus, 
  lastSaved, 
  onDiscardDraft, 
  onSaveNow,
  className 
}: DraftStatusProps) {
  const getStatusContent = () => {
    switch (saveStatus) {
      case 'saving':
        return {
          icon: <Loader2 className="h-3 w-3 animate-spin" />,
          text: 'Saving...',
          variant: 'secondary' as const
        };
      case 'saved':
        return {
          icon: <Check className="h-3 w-3" />,
          text: lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : 'All changes saved',
          variant: 'default' as const
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-3 w-3" />,
          text: 'Save failed',
          variant: 'destructive' as const
        };
      default:
        return {
          icon: <Save className="h-3 w-3" />,
          text: 'Ready to save',
          variant: 'outline' as const
        };
    }
  };

  const { icon, text, variant } = getStatusContent();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge variant={variant} className="flex items-center gap-1 text-xs">
        {icon}
        {text}
      </Badge>
      
      <div className="flex items-center gap-1">
        {saveStatus === 'error' && onSaveNow && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSaveNow}
            className="h-6 px-2 text-xs"
          >
            <Save className="h-3 w-3 mr-1" />
            Retry
          </Button>
        )}
        
        {onDiscardDraft && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDiscardDraft}
            className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Discard
          </Button>
        )}
      </div>
    </div>
  );
}