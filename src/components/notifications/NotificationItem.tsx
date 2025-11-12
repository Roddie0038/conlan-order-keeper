import { useNotifications } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink, Trash2, Bookmark, BookmarkCheck, Circle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface NotificationItemProps {
  notification: {
    id: string;
    notification_type: string;
    event_type: string;
    order_number: string | null;
    order_type: string | null;
    title: string;
    message: string;
    read: boolean;
    created_at: string;
    metadata: any;
  };
  onNavigate?: () => void;
}

export function NotificationItem({ notification, onNavigate }: NotificationItemProps) {
  const { markAsRead, deleteNotification, toggleSaveForLater } = useNotifications();
  const navigate = useNavigate();

  const handleClick = async () => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    // Close popover before navigating
    onNavigate?.();
    
    // Navigate to order management page with order filter (URL-encoded)
    if (notification.order_number) {
      navigate(`/order-management?order=${encodeURIComponent(notification.order_number)}`);
    } else {
      navigate('/order-management');
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteNotification(notification.id);
  };

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleSaveForLater(notification.id);
  };

  const getEventColor = (eventType: string) => {
    if (eventType.includes('approved') || eventType.includes('completed')) 
      return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
    if (eventType.includes('denied')) 
      return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
    if (eventType.includes('created')) 
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
    if (eventType.includes('updated')) 
      return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
    return 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20';
  };

  const getEventIcon = (eventType: string) => {
    if (eventType.includes('approved') || eventType.includes('completed')) return '✅';
    if (eventType.includes('denied')) return '❌';
    if (eventType.includes('created')) return '🆕';
    if (eventType.includes('updated')) return '🔄';
    if (eventType.includes('warranty')) return '🛡️';
    return '📢';
  };

  const isSaved = notification.metadata?.saved_for_later;

  return (
    <div
      className={`group p-4 hover:bg-accent/50 cursor-pointer transition-all duration-200 relative ${
        !notification.read 
          ? 'bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-l-4 border-primary' 
          : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
            !notification.read ? 'bg-primary/20 ring-2 ring-primary/30' : 'bg-muted'
          }`}>
            {getEventIcon(notification.event_type)}
          </div>
        </div>
        
        <div className="flex-1 space-y-2 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-sm">{notification.title}</p>
              {!notification.read && (
                <Circle className="h-2 w-2 fill-primary text-primary flex-shrink-0" />
              )}
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
          
          <div className="flex items-center gap-2 flex-wrap">
            {notification.order_type && (
              <Badge variant="outline" className={getEventColor(notification.event_type)}>
                {notification.order_type}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleSaveToggle}
            title={isSaved ? "Remove from saved" : "Save for later"}
          >
            {isSaved ? (
              <BookmarkCheck className="h-4 w-4 text-primary" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                onClick={(e) => e.stopPropagation()}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete notification?</AlertDialogTitle>
                <AlertDialogDescription>
                  This notification will be permanently deleted. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {notification.order_number && (
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
