import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface Notification {
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
  store_ref: string | null;
  plant_code: string | null;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Return early if no user is authenticated yet
  if (!user) {
    return (
      <NotificationContext.Provider value={{
        notifications: [],
        unreadCount: 0,
        markAsRead: async () => {},
        markAllAsRead: async () => {},
        refreshNotifications: async () => {}
      }}>
        {children}
      </NotificationContext.Provider>
    );
  }

  const fetchNotifications = async () => {
    if (!user) return;
    
    console.log('Fetching notifications for user:', user.id);
    
    const { data, error } = await supabase
      .from('user_notifications' as any)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) {
      console.error('Error fetching notifications:', error);
      return;
    }
    
    console.log(`Fetched ${data?.length || 0} notifications`);
    setNotifications((data || []) as unknown as Notification[]);
  };

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    console.log('Setting up realtime subscription for notifications');

    const channel = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Notification realtime update:', payload);
          fetchNotifications();
        }
      )
      .subscribe((status) => {
        console.log('Notification subscription status:', status);
      });

    return () => {
      console.log('Cleaning up notification subscription');
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('user_notifications' as any)
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) {
      console.error('Error marking notification as read:', error);
      return;
    }
    
    fetchNotifications();
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    const { error } = await supabase
      .from('user_notifications' as any)
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('read', false);
    
    if (error) {
      console.error('Error marking all notifications as read:', error);
      return;
    }
    
    fetchNotifications();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      refreshNotifications: fetchNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
