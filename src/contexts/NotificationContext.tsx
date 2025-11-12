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
  saved_for_later?: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  toggleSaveForLater: (id: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission);
      });
    } else if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Play notification sound
  const playNotificationSound = () => {
    try {
      // Simple notification beep using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  };

  // Show desktop notification
  const showDesktopNotification = (notification: Notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const desktopNotif = new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          tag: notification.id,
          requireInteraction: false
        });

        // Auto-close after 5 seconds
        setTimeout(() => desktopNotif.close(), 5000);
      } catch (error) {
        console.warn('Could not show desktop notification:', error);
      }
    }
  };

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
          
          // Play sound and show desktop notification for new notifications
          if (payload.eventType === 'INSERT' && payload.new) {
            playNotificationSound();
            showDesktopNotification(payload.new as Notification);
          }
          
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

  const deleteNotification = async (id: string) => {
    const { error } = await supabase
      .from('user_notifications' as any)
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting notification:', error);
      return;
    }
    
    fetchNotifications();
  };

  const toggleSaveForLater = async (id: string) => {
    const notification = notifications.find(n => n.id === id);
    if (!notification) return;

    const { error } = await supabase
      .from('user_notifications' as any)
      .update({ 
        metadata: { 
          ...notification.metadata, 
          saved_for_later: !notification.metadata?.saved_for_later 
        } 
      })
      .eq('id', id);
    
    if (error) {
      console.error('Error saving notification:', error);
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
      deleteNotification,
      toggleSaveForLater,
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
