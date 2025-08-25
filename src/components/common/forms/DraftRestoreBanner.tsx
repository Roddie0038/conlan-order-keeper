import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DraftRestoreBannerProps {
  message: string;
  onUseNewer?: () => void;
  onKeepCurrent?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function DraftRestoreBanner({
  message,
  onUseNewer,
  onKeepCurrent,
  onDismiss,
  className
}: DraftRestoreBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <Alert className={cn("mb-4 border-primary/20 bg-primary/5", className)}>
      <Info className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span className="text-sm">{message}</span>
        
        <div className="flex items-center gap-2 ml-4">
          {onUseNewer && (
            <Button
              variant="outline"
              size="sm"
              onClick={onUseNewer}
              className="h-7 px-3 text-xs"
            >
              Use Newer
            </Button>
          )}
          
          {onKeepCurrent && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onKeepCurrent}
              className="h-7 px-3 text-xs"
            >
              Keep This
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-7 w-7 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}