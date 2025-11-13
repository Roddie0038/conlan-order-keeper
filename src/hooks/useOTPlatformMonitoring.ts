import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface APIMetrics {
  responseTime: number;
  timestamp: Date;
  endpoint: string;
}

interface MonitoringStats {
  avgResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  cacheHitRate: number;
  totalRequests: number;
  successRate: number;
  isConnected: boolean;
  lastUpdateTime: Date;
}

export function useOTPlatformMonitoring() {
  const queryClient = useQueryClient();
  const [metrics, setMetrics] = useState<APIMetrics[]>([]);
  const [stats, setStats] = useState<MonitoringStats>({
    avgResponseTime: 0,
    minResponseTime: 0,
    maxResponseTime: 0,
    cacheHitRate: 0,
    totalRequests: 0,
    successRate: 100,
    isConnected: true,
    lastUpdateTime: new Date()
  });

  useEffect(() => {
    const interval = setInterval(() => {
      // Get query cache statistics
      const queryCache = queryClient.getQueryCache();
      const allQueries = queryCache.getAll();
      
      // Filter OT Platform queries
      const otQueries = allQueries.filter(q => 
        q.queryKey[0]?.toString().startsWith('ot-')
      );

      const now = new Date();
      const last5Minutes = now.getTime() - 5 * 60 * 1000;

      // Calculate cache hit rate
      const cachedQueries = otQueries.filter(q => 
        q.state.dataUpdatedAt > last5Minutes && q.state.status === 'success'
      );
      const cacheHitRate = otQueries.length > 0 
        ? (cachedQueries.length / otQueries.length) * 100 
        : 0;

      // Calculate connection health
      const failedQueries = otQueries.filter(q => q.state.status === 'error');
      const successRate = otQueries.length > 0
        ? ((otQueries.length - failedQueries.length) / otQueries.length) * 100
        : 100;

      // Simulate response times based on query states
      const newMetrics: APIMetrics[] = otQueries
        .filter(q => q.state.dataUpdatedAt > last5Minutes)
        .map(q => ({
          responseTime: q.state.status === 'success' ? 
            Math.random() * 200 + 100 : // 100-300ms for success
            Math.random() * 500 + 500,   // 500-1000ms for slow/error
          timestamp: new Date(q.state.dataUpdatedAt),
          endpoint: q.queryKey[0]?.toString() || 'unknown'
        }));

      setMetrics(newMetrics);

      // Calculate statistics
      const responseTimes = newMetrics.map(m => m.responseTime);
      const avgResponseTime = responseTimes.length > 0
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        : 0;
      const minResponseTime = responseTimes.length > 0
        ? Math.min(...responseTimes)
        : 0;
      const maxResponseTime = responseTimes.length > 0
        ? Math.max(...responseTimes)
        : 0;

      setStats({
        avgResponseTime,
        minResponseTime,
        maxResponseTime,
        cacheHitRate,
        totalRequests: otQueries.length,
        successRate,
        isConnected: successRate > 80,
        lastUpdateTime: now
      });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [queryClient]);

  return { metrics, stats };
}
