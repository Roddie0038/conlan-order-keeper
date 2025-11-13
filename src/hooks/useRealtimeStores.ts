import { useEffect } from 'react';
import { otClient } from '@/integrations/ot-platform/client';
import { useQueryClient } from '@tanstack/react-query';

export function useRealtimeStores() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = otClient
      .channel('stores-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'stores'
      }, (payload) => {
        console.log('🏪 Store updated:', payload);
        // Invalidate queries to refetch fresh data
        queryClient.invalidateQueries({ queryKey: ['ot-stores'] });
      })
      .subscribe();

    return () => {
      otClient.removeChannel(channel);
    };
  }, [queryClient]);
}
