import { useEffect } from 'react';
import { otClient } from '@/integrations/ot-platform/client';
import { useQueryClient } from '@tanstack/react-query';

export function useRealtimeColors() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = otClient
      .channel('colors-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'app_store_colors'
      }, (payload) => {
        console.log('🎨 Store color updated:', payload);
        // Invalidate queries to refetch fresh data
        queryClient.invalidateQueries({ queryKey: ['ot-store-colors'] });
      })
      .subscribe();

    return () => {
      otClient.removeChannel(channel);
    };
  }, [queryClient]);
}
