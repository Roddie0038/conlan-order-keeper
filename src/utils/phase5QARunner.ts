/**
 * Phase 5: Platform-Wide QA and Go-Live Readiness Testing
 * Comprehensive test suite for all notification types and routing scenarios
 */

import { hardenedNotificationTester } from "@/utils/testHardenedNotifications";
import { hardenedNotificationService } from "@/services/notificationHardeningService";
import { emailRoutingMonitor } from "@/services/emailRoutingMonitor";
import type { EmailType, OrderDataInput } from "@/services/emailRecipientResolver";

interface Phase5TestResult {
  phaseId: string;
  timestamp: string;
  overallStatus: 'PASS' | 'FAIL' | 'WARNING';
  notificationTests: any;
  routingHealth: any;
  storeStorageCoverage: any;
  performanceMetrics: any;
  goLiveReadiness: {
    isReady: boolean;
    blockers: string[];
    warnings: string[];
    recommendations: string[];
  };
}

export class Phase5QARunner {
  
  /**
   * Run comprehensive Platform-Wide QA for go-live readiness
   */
  async runComprehensiveQA(): Promise<Phase5TestResult> {
    const phaseId = `phase5-qa-${Date.now()}`;
    const startTime = Date.now();
    
    console.log(`🚀 PHASE 5 QA - Starting comprehensive platform-wide testing: ${phaseId}`);
    
    try {
      // 1. Run comprehensive notification tests for all order types
      console.log('📧 Testing all notification types...');
      const notificationTests = await hardenedNotificationTester.runComprehensiveTestSuite();
      
      // 2. Test routing health and coverage
      console.log('🏥 Validating routing health...');
      const routingHealth = await hardenedNotificationTester.testRoutingHealth();
      
      // 3. Test store coverage across all plants
      console.log('🏪 Testing store coverage...');
      const storeCoverage = await this.testStoreCoverage();
      
      // 4. Test performance and load scenarios
      console.log('⚡ Testing performance metrics...');
      const performanceMetrics = await this.testPerformanceMetrics();
      
      // 5. Generate go-live readiness assessment
      console.log('✅ Assessing go-live readiness...');
      const goLiveReadiness = this.assessGoLiveReadiness(
        notificationTests,
        routingHealth,
        storeCoverage,
        performanceMetrics
      );
      
      const totalDuration = Date.now() - startTime;
      
      const result: Phase5TestResult = {
        phaseId,
        timestamp: new Date().toISOString(),
        overallStatus: goLiveReadiness.isReady ? 'PASS' : (goLiveReadiness.blockers.length > 0 ? 'FAIL' : 'WARNING'),
        notificationTests,
        routingHealth,
        storeStorageCoverage: storeCoverage,
        performanceMetrics: {
          ...performanceMetrics,
          totalTestDuration: totalDuration
        },
        goLiveReadiness
      };
      
      // Generate and log comprehensive report
      const report = this.generatePhase5Report(result);
      console.log(report);
      
      return result;
      
    } catch (error) {
      console.error('❌ PHASE 5 QA - Critical error during testing:', error);
      throw new Error(`Phase 5 QA failed: ${error.message}`);
    }
  }
  
  /**
   * Test store coverage across all plants and notification types
   */
  private async testStoreCoverage(): Promise<{
    totalStores: number;
    coveredStores: number;
    uncoveredStores: string[];
    plantCoverage: Record<string, number>;
    criticalGaps: string[];
  }> {
    
    const testStores = [
      { store: 'Fort Worth 022', plant: 'Grand Prairie 097' }, // Critical store
      { store: 'Grand Prairie 027', plant: 'Grand Prairie 097' },
      { store: 'Houston 028', plant: 'Mulberry 099' },
      { store: 'San Antonio 029', plant: 'Romulus 098' },
      { store: 'Oklahoma City 030', plant: 'Grand Prairie 097' },
      { store: 'Dallas 031', plant: 'Grand Prairie 097' },
      { store: 'Austin 032', plant: 'Mulberry 099' }
    ];
    
    const emailTypes: EmailType[] = ['transfer', 'mto', 'wheel', 'warranty', 'cross_dock'];
    let coveredStores = 0;
    const uncoveredStores: string[] = [];
    const plantCoverage: Record<string, number> = {};
    const criticalGaps: string[] = [];
    
    for (const storeConfig of testStores) {
      let storeCovered = true;
      
      for (const emailType of emailTypes) {
        const orderData: OrderDataInput = {
          store: storeConfig.store,
          plant: storeConfig.plant,
          email: 'qa-test@conlantire.com',
          name: 'QA Test User'
        };
        
        try {
          const result = await hardenedNotificationService.sendHardenedNotification(
            orderData,
            emailType,
            `qa-test-${emailType}-${Date.now()}`,
            { quantity: 1, product_number: 'QA-TEST' }
          );
          
          if (result.recipients_count === 0) {
            storeCovered = false;
            criticalGaps.push(`${storeConfig.store} - ${emailType} has no recipients`);
          }
          
        } catch (error) {
          storeCovered = false;
          criticalGaps.push(`${storeConfig.store} - ${emailType} failed: ${error.message}`);
        }
      }
      
      if (storeCovered) {
        coveredStores++;
      } else {
        uncoveredStores.push(storeConfig.store);
      }
      
      // Track plant coverage
      const plant = storeConfig.plant;
      plantCoverage[plant] = (plantCoverage[plant] || 0) + (storeCovered ? 1 : 0);
    }
    
    return {
      totalStores: testStores.length,
      coveredStores,
      uncoveredStores,
      plantCoverage,
      criticalGaps
    };
  }
  
  /**
   * Test performance metrics and load scenarios
   */
  private async testPerformanceMetrics(): Promise<{
    averageResponseTime: number;
    maxResponseTime: number;
    successRate: number;
    concurrentLoadTest: any;
  }> {
    
    const responseTimes: number[] = [];
    let successCount = 0;
    const totalTests = 10;
    
    // Sequential performance test
    for (let i = 0; i < totalTests; i++) {
      const startTime = Date.now();
      
      try {
        const orderData: OrderDataInput = {
          store: 'Fort Worth 022',
          plant: 'Grand Prairie 097',
          email: 'performance-test@conlantire.com',
          name: 'Performance Test User'
        };
        
        await hardenedNotificationService.sendHardenedNotification(
          orderData,
          'transfer',
          `perf-test-${i}-${Date.now()}`,
          { quantity: 1, product_number: 'PERF-TEST' }
        );
        
        successCount++;
      } catch (error) {
        console.log(`Performance test ${i} failed:`, error.message);
      }
      
      const responseTime = Date.now() - startTime;
      responseTimes.push(responseTime);
    }
    
    // Concurrent load test
    const concurrentTests = Array.from({ length: 5 }, (_, i) => 
      this.runConcurrentNotificationTest(i)
    );
    
    const concurrentResults = await Promise.allSettled(concurrentTests);
    const concurrentSuccessCount = concurrentResults.filter(r => r.status === 'fulfilled').length;
    
    return {
      averageResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
      maxResponseTime: Math.max(...responseTimes),
      successRate: (successCount / totalTests) * 100,
      concurrentLoadTest: {
        totalConcurrent: concurrentTests.length,
        successfulConcurrent: concurrentSuccessCount,
        concurrentSuccessRate: (concurrentSuccessCount / concurrentTests.length) * 100
      }
    };
  }
  
  /**
   * Run a single concurrent notification test
   */
  private async runConcurrentNotificationTest(testIndex: number): Promise<boolean> {
    const orderData: OrderDataInput = {
      store: 'Grand Prairie 027',
      plant: 'Grand Prairie 097',
      email: `concurrent-test-${testIndex}@conlantire.com`,
      name: `Concurrent Test User ${testIndex}`
    };
    
    const result = await hardenedNotificationService.sendHardenedNotification(
      orderData,
      'mto',
      `concurrent-test-${testIndex}-${Date.now()}`,
      { quantity: 1, product_number: 'CONCURRENT-TEST' }
    );
    
    return result.success;
  }
  
  /**
   * Assess overall go-live readiness
   */
  private assessGoLiveReadiness(
    notificationTests: any,
    routingHealth: any,
    storeCoverage: any,
    performanceMetrics: any
  ): {
    isReady: boolean;
    blockers: string[];
    warnings: string[];
    recommendations: string[];
  } {
    
    const blockers: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    
    // Check notification test results
    if (notificationTests.criticalFailures > 0) {
      blockers.push(`${notificationTests.criticalFailures} critical notification failures detected`);
    }
    
    if (notificationTests.overallSuccess === false) {
      blockers.push('Overall notification test suite failed');
    }
    
    // Check routing health
    if (!routingHealth.isHealthy) {
      blockers.push('Email routing system is not healthy');
    }
    
    if (routingHealth.coverage.coveragePercentage < 90) {
      blockers.push(`Store coverage is ${routingHealth.coverage.coveragePercentage.toFixed(1)}% (minimum 90% required)`);
    }
    
    // Check store coverage
    if (storeCoverage.criticalGaps.length > 0) {
      blockers.push(`${storeCoverage.criticalGaps.length} critical store coverage gaps detected`);
    }
    
    // Check performance
    if (performanceMetrics.successRate < 95) {
      blockers.push(`Performance success rate is ${performanceMetrics.successRate.toFixed(1)}% (minimum 95% required)`);
    }
    
    if (performanceMetrics.averageResponseTime > 5000) {
      warnings.push(`Average response time is ${(performanceMetrics.averageResponseTime / 1000).toFixed(1)}s (recommend <5s)`);
    }
    
    // Generate recommendations
    if (routingHealth.coverage.coveragePercentage < 100) {
      recommendations.push(`Improve store coverage to 100% (currently ${routingHealth.coverage.coveragePercentage.toFixed(1)}%)`);
    }
    
    if (performanceMetrics.concurrentLoadTest.concurrentSuccessRate < 100) {
      recommendations.push('Optimize concurrent notification handling');
    }
    
    recommendations.push('Monitor notification logs for first 24 hours post go-live');
    recommendations.push('Set up automated health checks for critical stores');
    
    return {
      isReady: blockers.length === 0,
      blockers,
      warnings,
      recommendations
    };
  }
  
  /**
   * Generate comprehensive Phase 5 test report
   */
  private generatePhase5Report(result: Phase5TestResult): string {
    const status = result.overallStatus === 'PASS' ? '✅ READY FOR GO-LIVE' : 
                   result.overallStatus === 'FAIL' ? '❌ NOT READY - BLOCKERS EXIST' : 
                   '⚠️ READY WITH WARNINGS';
    
    return `
🚀 PHASE 5: PLATFORM-WIDE QA & GO-LIVE READINESS REPORT
=======================================================

Test ID: ${result.phaseId}
Timestamp: ${result.timestamp}
Overall Status: ${status}

📊 NOTIFICATION SYSTEM TEST RESULTS
-----------------------------------
Test Suite: ${result.notificationTests.suiteName}
Total Tests: ${result.notificationTests.tests.length}
Passed: ${result.notificationTests.tests.filter((t: any) => t.success).length}
Failed: ${result.notificationTests.tests.filter((t: any) => !t.success).length}
Critical Failures: ${result.notificationTests.criticalFailures}
Overall Success: ${result.notificationTests.overallSuccess ? '✅' : '❌'}

🏥 ROUTING HEALTH STATUS
-----------------------
System Health: ${result.routingHealth.isHealthy ? '✅ Healthy' : '❌ Degraded'}
Store Coverage: ${result.routingHealth.coverage.coveragePercentage.toFixed(1)}%
Stores Covered: ${result.routingHealth.coverage.storesCovered.length}/${result.routingHealth.coverage.totalStores}
Recent Alerts: ${result.routingHealth.recentAlerts}

🏪 STORE COVERAGE ANALYSIS
--------------------------
Total Stores Tested: ${result.storeStorageCoverage.totalStores}
Fully Covered: ${result.storeStorageCoverage.coveredStores}
Coverage Rate: ${((result.storeStorageCoverage.coveredStores / result.storeStorageCoverage.totalStores) * 100).toFixed(1)}%
Uncovered Stores: ${result.storeStorageCoverage.uncoveredStores.join(', ') || 'None'}
Critical Gaps: ${result.storeStorageCoverage.criticalGaps.length}

⚡ PERFORMANCE METRICS
--------------------
Average Response Time: ${(result.performanceMetrics.averageResponseTime / 1000).toFixed(1)}s
Max Response Time: ${(result.performanceMetrics.maxResponseTime / 1000).toFixed(1)}s
Success Rate: ${result.performanceMetrics.successRate.toFixed(1)}%
Concurrent Success Rate: ${result.performanceMetrics.concurrentLoadTest.concurrentSuccessRate.toFixed(1)}%
Total Test Duration: ${(result.performanceMetrics.totalTestDuration / 1000).toFixed(1)}s

🚦 GO-LIVE READINESS ASSESSMENT
------------------------------
Ready for Go-Live: ${result.goLiveReadiness.isReady ? '✅ YES' : '❌ NO'}

🚫 BLOCKERS (${result.goLiveReadiness.blockers.length})
${result.goLiveReadiness.blockers.map(b => `• ${b}`).join('\n') || '• None'}

⚠️ WARNINGS (${result.goLiveReadiness.warnings.length})
${result.goLiveReadiness.warnings.map(w => `• ${w}`).join('\n') || '• None'}

📝 RECOMMENDATIONS (${result.goLiveReadiness.recommendations.length})
${result.goLiveReadiness.recommendations.map(r => `• ${r}`).join('\n')}

🔧 SYSTEM STATUS SUMMARY
------------------------
Phase 1: Order Submission Interfaces ✅ Complete
Phase 2: Supabase Insert + Payload Standardization ✅ Complete  
Phase 3: Email Resolution System Alignment ✅ Complete
Phase 4: Notification & Logging Hardening ✅ Complete
Phase 5: Platform-Wide QA & Go-Live Readiness ✅ Complete

📋 DETAILED TEST BREAKDOWN
--------------------------
${result.notificationTests.tests.map((test: any) => `
${test.success ? '✅' : '❌'} ${test.testType}
  Duration: ${test.duration}ms | Attempts: ${test.attempts}
  Status: ${test.finalStatus} | Recipients: ${test.recipients}
  Source: ${test.resolutionSource}
  Fallbacks: ${test.fallbacksUsed.join(', ') || 'None'}
  Errors: ${test.errors.join(', ') || 'None'}
`).join('')}

Generated at: ${new Date().toISOString()}
    `.trim();
  }
}

// Export singleton instance
export const phase5QARunner = new Phase5QARunner();

// Make available for console testing
if (typeof window !== 'undefined') {
  (window as any).runPhase5QA = () => phase5QARunner.runComprehensiveQA();
}