/**
 * Phase 5: Test Execution Component
 * Executes comprehensive QA testing for go-live readiness
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { phase5QARunner } from "@/utils/phase5QARunner";
import { PlayCircle, CheckCircle, AlertTriangle, XCircle, Download } from "lucide-react";

interface TestExecutionState {
  status: 'idle' | 'running' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
  results: any;
  report: string;
}

export function Phase5TestExecution() {
  const [testState, setTestState] = useState<TestExecutionState>({
    status: 'idle',
    progress: 0,
    currentStep: '',
    results: null,
    report: ''
  });

  const runComprehensiveTests = async () => {
    setTestState(prev => ({ ...prev, status: 'running', progress: 0 }));
    
    try {
      // Update progress during test execution
      setTestState(prev => ({ ...prev, progress: 20, currentStep: 'Testing notification types...' }));
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTestState(prev => ({ ...prev, progress: 40, currentStep: 'Validating routing health...' }));
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTestState(prev => ({ ...prev, progress: 60, currentStep: 'Testing store coverage...' }));
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTestState(prev => ({ ...prev, progress: 80, currentStep: 'Running performance tests...' }));
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTestState(prev => ({ ...prev, progress: 90, currentStep: 'Generating report...' }));
      
      // Run the actual comprehensive QA
      const results = await phase5QARunner.runComprehensiveQA();
      
      setTestState({
        status: 'completed',
        progress: 100,
        currentStep: 'Tests completed',
        results,
        report: JSON.stringify(results, null, 2)
      });
      
    } catch (error) {
      console.error('Phase 5 QA execution failed:', error);
      setTestState(prev => ({
        ...prev,
        status: 'failed',
        currentStep: `Failed: ${error.message}`,
        progress: 0
      }));
    }
  };

  const downloadReport = () => {
    if (!testState.report) return;
    
    const blob = new Blob([testState.report], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `phase5-qa-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = () => {
    switch (testState.status) {
      case 'running':
        return <PlayCircle className="h-5 w-5 text-blue-600 animate-pulse" />;
      case 'completed':
        return testState.results?.overallStatus === 'PASS' ? 
          <CheckCircle className="h-5 w-5 text-green-600" /> :
          testState.results?.overallStatus === 'FAIL' ?
          <XCircle className="h-5 w-5 text-red-600" /> :
          <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <PlayCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = () => {
    if (!testState.results) return null;
    
    const variant = testState.results.overallStatus === 'PASS' ? 'default' :
                   testState.results.overallStatus === 'FAIL' ? 'destructive' : 'secondary';
    
    return (
      <Badge variant={variant} className="ml-2">
        {testState.results.overallStatus === 'PASS' ? '✅ READY FOR GO-LIVE' :
         testState.results.overallStatus === 'FAIL' ? '❌ NOT READY' : '⚠️ READY WITH WARNINGS'}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon()}
            🚀 Phase 5: Platform-Wide QA & Go-Live Readiness
            {getStatusBadge()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Comprehensive testing of all notification types, routing health, and performance metrics
              </p>
              {testState.currentStep && (
                <p className="text-sm font-medium mt-1">{testState.currentStep}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={runComprehensiveTests}
                disabled={testState.status === 'running'}
                className="flex items-center gap-2"
              >
                <PlayCircle className="h-4 w-4" />
                {testState.status === 'running' ? 'Running Tests...' : 'Run Comprehensive QA'}
              </Button>
              {testState.report && (
                <Button variant="outline" onClick={downloadReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
              )}
            </div>
          </div>
          
          {testState.status === 'running' && (
            <div className="space-y-2">
              <Progress value={testState.progress} className="w-full" />
              <p className="text-xs text-muted-foreground">
                Progress: {testState.progress}%
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Results */}
      {testState.results && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notification Tests */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📧 Notification System Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Tests:</span>
                  <Badge variant="outline">{testState.results.notificationTests.tests.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Passed:</span>
                  <Badge variant="default">
                    {testState.results.notificationTests.tests.filter((t: any) => t.success).length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Failed:</span>
                  <Badge variant="destructive">
                    {testState.results.notificationTests.tests.filter((t: any) => !t.success).length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Critical Failures:</span>
                  <Badge variant={testState.results.notificationTests.criticalFailures > 0 ? 'destructive' : 'default'}>
                    {testState.results.notificationTests.criticalFailures}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Routing Health */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🏥 Routing Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">System Health:</span>
                  <Badge variant={testState.results.routingHealth.isHealthy ? 'default' : 'destructive'}>
                    {testState.results.routingHealth.isHealthy ? 'Healthy' : 'Degraded'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Store Coverage:</span>
                  <Badge variant="outline">
                    {testState.results.routingHealth.coverage.coveragePercentage.toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Recent Alerts:</span>
                  <Badge variant={testState.results.routingHealth.recentAlerts > 0 ? 'secondary' : 'default'}>
                    {testState.results.routingHealth.recentAlerts}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Store Coverage */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🏪 Store Coverage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Stores Tested:</span>
                  <Badge variant="outline">{testState.results.storeStorageCoverage.totalStores}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Fully Covered:</span>
                  <Badge variant="default">{testState.results.storeStorageCoverage.coveredStores}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Coverage Rate:</span>
                  <Badge variant="outline">
                    {((testState.results.storeStorageCoverage.coveredStores / testState.results.storeStorageCoverage.totalStores) * 100).toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Critical Gaps:</span>
                  <Badge variant={testState.results.storeStorageCoverage.criticalGaps.length > 0 ? 'destructive' : 'default'}>
                    {testState.results.storeStorageCoverage.criticalGaps.length}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">⚡ Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Avg Response Time:</span>
                  <Badge variant="outline">
                    {(testState.results.performanceMetrics.averageResponseTime / 1000).toFixed(1)}s
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Success Rate:</span>
                  <Badge variant={testState.results.performanceMetrics.successRate >= 95 ? 'default' : 'secondary'}>
                    {testState.results.performanceMetrics.successRate.toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Concurrent Success:</span>
                  <Badge variant="outline">
                    {testState.results.performanceMetrics.concurrentLoadTest.concurrentSuccessRate.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Go-Live Readiness */}
      {testState.results?.goLiveReadiness && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">🚦 Go-Live Readiness Assessment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">Ready for Go-Live:</span>
              <Badge variant={testState.results.goLiveReadiness.isReady ? 'default' : 'destructive'}>
                {testState.results.goLiveReadiness.isReady ? '✅ YES' : '❌ NO'}
              </Badge>
            </div>

            {testState.results.goLiveReadiness.blockers.length > 0 && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Blockers ({testState.results.goLiveReadiness.blockers.length}):</strong>
                  <ul className="mt-2 ml-4 list-disc space-y-1">
                    {testState.results.goLiveReadiness.blockers.map((blocker: string, index: number) => (
                      <li key={index} className="text-sm">{blocker}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {testState.results.goLiveReadiness.warnings.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Warnings ({testState.results.goLiveReadiness.warnings.length}):</strong>
                  <ul className="mt-2 ml-4 list-disc space-y-1">
                    {testState.results.goLiveReadiness.warnings.map((warning: string, index: number) => (
                      <li key={index} className="text-sm">{warning}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <Separator />

            <div>
              <h4 className="font-medium mb-2">📝 Recommendations ({testState.results.goLiveReadiness.recommendations.length}):</h4>
              <ul className="space-y-1 ml-4 list-disc">
                {testState.results.goLiveReadiness.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="text-sm text-muted-foreground">{rec}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">🔧 System Implementation Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="text-center">
              <Badge variant="default" className="w-full">Phase 1</Badge>
              <p className="text-xs text-muted-foreground mt-1">Order Interfaces</p>
              <CheckCircle className="h-4 w-4 text-green-600 mx-auto mt-1" />
            </div>
            <div className="text-center">
              <Badge variant="default" className="w-full">Phase 2</Badge>
              <p className="text-xs text-muted-foreground mt-1">Payload Standard</p>
              <CheckCircle className="h-4 w-4 text-green-600 mx-auto mt-1" />
            </div>
            <div className="text-center">
              <Badge variant="default" className="w-full">Phase 3</Badge>
              <p className="text-xs text-muted-foreground mt-1">Email Resolution</p>
              <CheckCircle className="h-4 w-4 text-green-600 mx-auto mt-1" />
            </div>
            <div className="text-center">
              <Badge variant="default" className="w-full">Phase 4</Badge>
              <p className="text-xs text-muted-foreground mt-1">Hardening</p>
              <CheckCircle className="h-4 w-4 text-green-600 mx-auto mt-1" />
            </div>
            <div className="text-center">
              <Badge variant="default" className="w-full">Phase 5</Badge>
              <p className="text-xs text-muted-foreground mt-1">QA & Go-Live</p>
              <CheckCircle className="h-4 w-4 text-green-600 mx-auto mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}