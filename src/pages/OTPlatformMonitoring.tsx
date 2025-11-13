import { ConditionalSidebar } from "@/components/ConditionalSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOTPlatformMonitoring } from "@/hooks/useOTPlatformMonitoring";
import { Activity, Clock, Database, TrendingUp, Zap, CheckCircle2, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function OTPlatformMonitoring() {
  const { stats } = useOTPlatformMonitoring();

  const getHealthColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return "text-green-600 dark:text-green-400";
    if (value >= thresholds.warning) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getResponseTimeColor = (ms: number) => {
    if (ms <= 200) return "text-green-600 dark:text-green-400";
    if (ms <= 500) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <ConditionalSidebar>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">OT Platform Monitoring</h1>
          <p className="text-muted-foreground">
            Real-time API performance, cache metrics, and connection health
          </p>
        </div>

        {/* Connection Status */}
        <Card className="mb-6 border-l-4" style={{
          borderLeftColor: stats.isConnected ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'
        }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {stats.isConnected ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                Connection Status
              </CardTitle>
              <Badge variant={stats.isConnected ? "default" : "destructive"}>
                {stats.isConnected ? "CONNECTED" : "DEGRADED"}
              </Badge>
            </div>
            <CardDescription>
              Last updated: {stats.lastUpdateTime.toLocaleTimeString()}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Metrics Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
          {/* Average Response Time */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Response Time
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getResponseTimeColor(stats.avgResponseTime)}`}>
                {stats.avgResponseTime.toFixed(0)}ms
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Min: {stats.minResponseTime.toFixed(0)}ms | Max: {stats.maxResponseTime.toFixed(0)}ms
              </p>
            </CardContent>
          </Card>

          {/* Cache Hit Rate */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Cache Hit Rate
              </CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getHealthColor(stats.cacheHitRate, { good: 70, warning: 50 })}`}>
                {stats.cacheHitRate.toFixed(1)}%
              </div>
              <Progress value={stats.cacheHitRate} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {stats.cacheHitRate >= 70 ? "Excellent" : stats.cacheHitRate >= 50 ? "Good" : "Needs improvement"}
              </p>
            </CardContent>
          </Card>

          {/* Success Rate */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Success Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getHealthColor(stats.successRate, { good: 95, warning: 80 })}`}>
                {stats.successRate.toFixed(1)}%
              </div>
              <Progress value={stats.successRate} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalRequests} total requests
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Metrics */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Performance Indicators */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Performance Indicators
              </CardTitle>
              <CardDescription>
                Key performance metrics for OT Platform API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Response Time Quality</span>
                <Badge variant={stats.avgResponseTime <= 200 ? "default" : stats.avgResponseTime <= 500 ? "secondary" : "destructive"}>
                  {stats.avgResponseTime <= 200 ? "Excellent" : stats.avgResponseTime <= 500 ? "Good" : "Poor"}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Cache Efficiency</span>
                <Badge variant={stats.cacheHitRate >= 70 ? "default" : stats.cacheHitRate >= 50 ? "secondary" : "destructive"}>
                  {stats.cacheHitRate >= 70 ? "Optimal" : stats.cacheHitRate >= 50 ? "Moderate" : "Low"}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">API Reliability</span>
                <Badge variant={stats.successRate >= 95 ? "default" : stats.successRate >= 80 ? "secondary" : "destructive"}>
                  {stats.successRate >= 95 ? "Stable" : stats.successRate >= 80 ? "Unstable" : "Critical"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Health
              </CardTitle>
              <CardDescription>
                Overall integration health status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>API Connection</span>
                  <span className={stats.isConnected ? "text-green-600" : "text-red-600"}>
                    {stats.isConnected ? "Healthy" : "Degraded"}
                  </span>
                </div>
                <Progress value={stats.isConnected ? 100 : 50} />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Query Cache</span>
                  <span className="text-green-600">Active</span>
                </div>
                <Progress value={100} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Real-time Sync</span>
                  <span className="text-green-600">Operational</span>
                </div>
                <Progress value={100} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Thresholds Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Performance Thresholds</CardTitle>
            <CardDescription>
              Reference values for monitoring metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Response Time</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-600"></div>
                    Excellent: &lt;200ms
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-600"></div>
                    Good: 200-500ms
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-600"></div>
                    Poor: &gt;500ms
                  </li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Cache Hit Rate</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-600"></div>
                    Optimal: &gt;70%
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-600"></div>
                    Moderate: 50-70%
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-600"></div>
                    Low: &lt;50%
                  </li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Success Rate</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-600"></div>
                    Stable: &gt;95%
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-600"></div>
                    Unstable: 80-95%
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-600"></div>
                    Critical: &lt;80%
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ConditionalSidebar>
  );
}
