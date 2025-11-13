import { useEffect } from 'react';
import { otClient } from '@/integrations/ot-platform/client';
import { useQueryClient } from '@tanstack/react-query';

export function useRealtimePlants() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = otClient
      .channel('plants-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'app_plants'
      }, (payload) => {
        console.log('🏭 Plant updated:', payload);
        // Invalidate queries to refetch fresh data
        queryClient.invalidateQueries({ queryKey: ['ot-plants'] });
      })
      .subscribe();

    return () => {
      otClient.removeChannel(channel);
    };
  }, [queryClient]);
}
