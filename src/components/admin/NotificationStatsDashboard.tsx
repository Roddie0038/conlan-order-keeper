/**
 * Phase 4: Notification Statistics Dashboard
 * Displays comprehensive hardened notification metrics and system health
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { hardenedNotificationService } from "@/services/notificationHardeningService";
import { emailRoutingMonitor } from "@/services/emailRoutingMonitor";
import { AlertTriangle, CheckCircle, Clock, TrendingUp, RefreshCw } from "lucide-react";

interface NotificationStats {
  totalSessions: number;
  successRate: number;
  averageAttempts: number;
  averageDuration: number;
  fallbackUsage: Record<string, number>;
  errorCategories: Record<string, number>;
  criticalIssues: string[];
}

export function NotificationStatsDashboard() {
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [routingHealth, setRoutingHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadStatistics = async () => {
    setLoading(true);
    try {
      const [notificationStats, healthStatus] = await Promise.all([
        hardenedNotificationService.getNotificationStatistics(24),
        emailRoutingMonitor.getRoutingHealth()
      ]);
      
      setStats(notificationStats);
      setRoutingHealth(healthStatus);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load notification statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatistics();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadStatistics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getHealthBadgeVariant = (isHealthy: boolean) => {
    return isHealthy ? "default" : "destructive";
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 95) return "text-green-600";
    if (rate >= 85) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading && !stats) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Loading Notification Statistics...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-20 bg-muted rounded animate-pulse" />
            <div className="h-20 bg-muted rounded animate-pulse" />
            <div className="h-20 bg-muted rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">🛡️ Notification Hardening Dashboard</h2>
          <p className="text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <Button onClick={loadStatistics} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {routingHealth?.isHealthy ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              )}
              <Badge variant={getHealthBadgeVariant(routingHealth?.isHealthy)}>
                {routingHealth?.isHealthy ? 'Healthy' : 'Degraded'}
              </Badge>
            </div>
            {routingHealth && (
              <div className="mt-2 text-xs text-muted-foreground">
                {routingHealth.criticalAlerts} critical, {routingHealth.warningAlerts} warnings
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span className={`text-2xl font-bold ${getSuccessRateColor(stats?.successRate || 0)}`}>
                {stats?.successRate?.toFixed(1) || '0'}%
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {stats?.totalSessions || 0} total sessions
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Attempts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <span className="text-2xl font-bold">
                {stats?.averageAttempts?.toFixed(1) || '0'}
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              per notification session
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-600" />
              <span className="text-2xl font-bold">
                {stats?.averageDuration ? (stats.averageDuration / 1000).toFixed(1) : '0'}s
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              per notification session
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Issues Alert */}
      {stats?.criticalIssues && stats.criticalIssues.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Critical Issues Detected:</strong>
            <ul className="mt-2 ml-4 list-disc">
              {stats.criticalIssues.slice(0, 5).map((issue, index) => (
                <li key={index} className="text-sm">{issue}</li>
              ))}
            </ul>
            {stats.criticalIssues.length > 5 && (
              <p className="text-sm mt-2">... and {stats.criticalIssues.length - 5} more issues</p>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fallback Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Fallback Strategies Used</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.fallbackUsage && Object.keys(stats.fallbackUsage).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(stats.fallbackUsage).map(([fallback, count]) => (
                  <div key={fallback} className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">
                      {fallback.replace(/_/g, ' ')}
                    </span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No fallback strategies used in the last 24 hours</p>
            )}
          </CardContent>
        </Card>

        {/* Error Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Error Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.errorCategories && Object.keys(stats.errorCategories).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(stats.errorCategories).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">
                      {category.replace(/_/g, ' ')}
                    </span>
                    <Badge variant={category === 'timeout' ? 'destructive' : 'secondary'}>
                      {count}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No errors recorded in the last 24 hours</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Routing Results */}
      {routingHealth?.recentRoutingResults && routingHealth.recentRoutingResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Routing Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {routingHealth.recentRoutingResults.slice(0, 10).map((result: any, index: number) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">
                      {result.orderType}
                    </Badge>
                    <span className="text-sm">{result.storeNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {result.recipientCount} recipients
                    </span>
                    <Badge variant={result.source === 'database' ? 'default' : 'secondary'} className="text-xs">
                      {result.source}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">System Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Phase 4 Status:</span>
              <Badge variant="default" className="ml-2">Active</Badge>
            </div>
            <div>
              <span className="font-medium">Hardening Service:</span>
              <Badge variant="default" className="ml-2">Online</Badge>
            </div>
          </div>
          
          <Separator />
          
          <div className="text-xs text-muted-foreground">
            <p><strong>Phase 4:</strong> Notification & Logging Hardening Complete</p>
            <p>• Comprehensive retry logic with exponential backoff</p>
            <p>• Multi-tier fallback routing strategies</p>
            <p>• Detailed logging and error tracking</p>
            <p>• Real-time health monitoring and alerting</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}