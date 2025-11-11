import { useNotifications } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink } from 'lucide-react';

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
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const { markAsRead } = useNotifications();
  const navigate = useNavigate();

  const handleClick = async () => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    // Navigate to order management page with order filter
    if (notification.order_number) {
      navigate(`/order-management?order=${notification.order_number}`);
    }
  };

  const getEventBadgeVariant = (eventType: string): "default" | "secondary" | "destructive" | "outline" => {
    if (eventType.includes('approved') || eventType.includes('completed')) return 'default';
    if (eventType.includes('denied')) return 'destructive';
    if (eventType.includes('created')) return 'secondary';
    return 'outline';
  };

  return (
    <div
      className={`p-4 hover:bg-accent cursor-pointer transition-colors ${
        !notification.read ? 'bg-primary/5' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm">{notification.title}</p>
            {!notification.read && (
              <div className="h-2 w-2 rounded-full bg-primary" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">{notification.message}</p>
          <div className="flex items-center gap-2 mt-2">
            {notification.order_type && (
              <Badge variant={getEventBadgeVariant(notification.event_type)}>
                {notification.order_type}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>
        {notification.order_number && (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ExternalLink className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
