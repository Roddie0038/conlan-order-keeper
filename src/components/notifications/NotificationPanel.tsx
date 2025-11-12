import { useNotifications } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotificationItem } from './NotificationItem';
import { CheckCheck, Bell, Bookmark } from 'lucide-react';

export interface NotificationPanelProps {
  onNavigate?: () => void;
}

export function NotificationPanel({ onNavigate }: NotificationPanelProps) {
  const { notifications, unreadCount, markAllAsRead } = useNotifications();

  const unreadNotifications = notifications.filter(n => !n.read);
  const savedNotifications = notifications.filter(n => n.metadata?.saved_for_later);

  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
          <Bell className="h-8 w-8 text-muted-foreground opacity-50" />
        </div>
        <p className="text-sm text-muted-foreground">No notifications yet</p>
        <p className="text-xs text-muted-foreground mt-1">We'll notify you when something important happens</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/5 to-transparent">
        <div>
          <h3 className="font-semibold text-lg">Notifications</h3>
          {unreadCount > 0 && (
            <p className="text-xs text-muted-foreground">
              {unreadCount} new notification{unreadCount > 1 ? 's' : ''}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="text-xs hover:bg-primary/10"
          >
            <CheckCheck className="h-4 w-4 mr-1" />
            Mark all read
          </Button>
        )}
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
          <TabsTrigger 
            value="all" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            All ({notifications.length})
          </TabsTrigger>
          <TabsTrigger 
            value="unread"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Unread ({unreadNotifications.length})
          </TabsTrigger>
          <TabsTrigger 
            value="saved"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <Bookmark className="h-3 w-3 mr-1" />
            Saved ({savedNotifications.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="m-0">
          <ScrollArea className="h-[450px]">
            <div className="divide-y">
              {notifications.map(notification => (
                <NotificationItem key={notification.id} notification={notification} onNavigate={onNavigate} />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="unread" className="m-0">
          <ScrollArea className="h-[450px]">
            {unreadNotifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <CheckCheck className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">All caught up!</p>
              </div>
            ) : (
              <div className="divide-y">
                {unreadNotifications.map(notification => (
                  <NotificationItem key={notification.id} notification={notification} onNavigate={onNavigate} />
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="saved" className="m-0">
          <ScrollArea className="h-[450px]">
            {savedNotifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Bookmark className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No saved notifications</p>
              </div>
            ) : (
              <div className="divide-y">
                {savedNotifications.map(notification => (
                  <NotificationItem key={notification.id} notification={notification} onNavigate={onNavigate} />
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
