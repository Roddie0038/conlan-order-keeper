import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useRegistrationNotification = () => {
  useEffect(() => {
    // Set up realtime subscription to pending_registrations table
    const channel = supabase
      .channel('pending-registrations-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pending_registrations',
          filter: 'email_verified=eq.true'
        },
        async (payload) => {
          console.log('Registration email verified:', payload);
          
          // Check if this is a new verification (status changed to pending_admin_review)
          if (payload.new.status === 'pending_admin_review' && 
              payload.old.status === 'pending_verification') {
            
            try {
              // Call the admin notification function
              const { error } = await supabase.functions.invoke('new-user-registration-notification');
              
              if (error) {
                console.error('Failed to send admin notification:', error);
              } else {
                console.log('Admin notification sent successfully');
              }
            } catch (error) {
              console.error('Error calling notification function:', error);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
};