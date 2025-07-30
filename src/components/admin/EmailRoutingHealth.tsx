import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, AlertTriangle, CheckCircle, RefreshCw, Activity, Mail, Database } from 'lucide-react';
import { emailRoutingMonitor, type EmailRoutingHealth } from '@/services/emailRoutingMonitor';
import { toast } from 'sonner';

export function EmailRoutingHealth() {
  const [health, setHealth] = useState<EmailRoutingHealth | null>(null);
  const [configValidation, setConfigValidation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHealthData = async () => {
    try {
      setRefreshing(true);
      const [healthData, configData] = await Promise.all([
        emailRoutingMonitor.getRoutingHealth(),
        emailRoutingMonitor.validateRoutingConfiguration()
      ]);
      
      setHealth(healthData);
      setConfigValidation(configData);
    } catch (error) {
      console.error('Failed to fetch email routing health:', error);
      toast.error('Failed to load email routing health data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Email Routing Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading health data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getHealthBadge = () => {
    if (!health) return <Badge variant="destructive">Unknown</Badge>;
    
    if (health.isHealthy) {
      return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Healthy</Badge>;
    }
    
    if (health.criticalAlerts > 0) {
      return <Badge variant="destructive">Critical Issues</Badge>;
    }
    
    return <Badge variant="secondary">Warning Issues</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Email Routing Health Status
            </div>
            <div className="flex items-center gap-2">
              {getHealthBadge()}
              <Button
                variant="outline"
                size="sm"
                onClick={fetchHealthData}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Last updated: {health?.lastCheckTime ? new Date(health.lastCheckTime).toLocaleString() : 'Unknown'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{health?.totalAlerts || 0}</div>
              <div className="text-sm text-muted-foreground">Total Alerts (24h)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{health?.criticalAlerts || 0}</div>
              <div className="text-sm text-muted-foreground">Critical Alerts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{health?.warningAlerts || 0}</div>
              <div className="text-sm text-muted-foreground">Warning Alerts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {health?.recentRoutingResults?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Recent Routes</div>
            </div>
          </div>

          {health && !health.isHealthy && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Email routing system has detected issues. Please review the details below and take corrective action.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Detailed Health Data */}
      <Tabs defaultValue="configuration" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="configuration" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="recent-activity" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Recent Activity
          </TabsTrigger>
          <TabsTrigger value="store-coverage" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Store Coverage
          </TabsTrigger>
        </TabsList>

        <TabsContent value="configuration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Routing Configuration Status</CardTitle>
              <CardDescription>
                Validation results for email routing configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              {configValidation ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {configValidation.isValid ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-green-600 font-medium">Configuration Valid</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <span className="text-red-600 font-medium">Configuration Issues Found</span>
                      </>
                    )}
                  </div>

                  {configValidation.issues.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-destructive">Issues Found:</h4>
                      {configValidation.issues.map((issue: string, index: number) => (
                        <Alert key={index} variant="destructive">
                          <AlertDescription>{issue}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No configuration data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent-activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Routing Activity</CardTitle>
              <CardDescription>
                Last 50 email routing attempts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {health?.recentRoutingResults && health.recentRoutingResults.length > 0 ? (
                <div className="space-y-2">
                  {health.recentRoutingResults.map((result, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{result.orderType}</Badge>
                        <span className="font-mono text-sm">Store {result.storeNumber}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{result.recipientCount} recipients</span>
                        <Badge variant={result.source === 'database' ? 'default' : 'secondary'}>
                          {result.source}
                        </Badge>
                        <span>{new Date(result.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No recent routing activity found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="store-coverage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Store Email Coverage</CardTitle>
              <CardDescription>
                Email routing coverage status for all stores
              </CardDescription>
            </CardHeader>
            <CardContent>
              {configValidation ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-green-600 mb-3 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Stores with Coverage ({configValidation.storesCovered.length})
                    </h4>
                    <div className="space-y-1">
                      {configValidation.storesCovered.map((store: string) => (
                        <Badge key={store} variant="default" className="bg-green-100 text-green-800 border-green-200">
                          Store {store}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-red-600 mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Stores Missing Coverage ({configValidation.storesMissingCoverage.length})
                    </h4>
                    <div className="space-y-1">
                      {configValidation.storesMissingCoverage.map((store: string) => (
                        <Badge key={store} variant="destructive">
                          Store {store}
                        </Badge>
                      ))}
                      {configValidation.storesMissingCoverage.length === 0 && (
                        <span className="text-green-600 text-sm">All stores have email coverage ✓</span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No store coverage data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}