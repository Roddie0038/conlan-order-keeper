import { Bell, BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useContext } from 'react';
import { NotificationContext } from '@/contexts/NotificationContext';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { NotificationPanel } from './NotificationPanel';

export function NotificationBell() {
  const context = useContext(NotificationContext);
  
  // Don't render if context isn't available yet
  if (!context) {
    return null;
  }
  
  const { unreadCount } = context;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative hover:bg-primary/10 transition-all duration-200"
        >
          {unreadCount > 0 ? (
            <BellRing className="h-5 w-5 text-primary animate-pulse" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 text-xs bg-gradient-to-r from-red-500 to-orange-500 border-2 border-background animate-bounce"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[420px] p-0 shadow-2xl border-primary/20" align="end">
        <NotificationPanel />
      </PopoverContent>
    </Popover>
  );
}
