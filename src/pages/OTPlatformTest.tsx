import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Play, CheckCircle2, XCircle, Clock } from "lucide-react";
import { runAllTests, TestResult } from "@/integrations/ot-platform/tests/integrationTests";

export default function OTPlatformTest() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const handleRunTests = async () => {
    setIsRunning(true);
    setResults([]);
    
    try {
      const testResults = await runAllTests();
      setResults(testResults);
    } catch (error) {
      console.error("Test execution error:", error);
    } finally {
      setIsRunning(false);
    }
  };

  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">OT Platform Integration Test Suite</h1>
        <p className="text-muted-foreground">
          Verify connectivity and data integrity with OT Platform before removing hardcoded data
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connection Details</CardTitle>
          <CardDescription>
            Testing connection to: <code className="text-xs bg-muted px-2 py-1 rounded">https://hpgjbpvugasktphwntee.supabase.co</code>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button 
                onClick={handleRunTests} 
                disabled={isRunning}
                size="lg"
                className="w-full sm:w-auto"
              >
                <Play className="mr-2 h-4 w-4" />
                {isRunning ? "Running Tests..." : "Run All Tests"}
              </Button>
              
              {results.length > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant={passedCount === totalCount ? "default" : "destructive"}>
                    {passedCount}/{totalCount} Passed
                  </Badge>
                </div>
              )}
            </div>

            {results.length > 0 && (
              <div className="space-y-3 mt-6">
                <h3 className="font-semibold text-lg">Test Results</h3>
                
                {results.map((result, index) => (
                  <Collapsible key={index}>
                    <Card>
                      <CollapsibleTrigger className="w-full">
                        <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {result.passed ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                              ) : (
                                <XCircle className="h-5 w-5 text-destructive" />
                              )}
                              <div className="text-left">
                                <CardTitle className="text-base">{result.name}</CardTitle>
                                <CardDescription className="text-sm whitespace-pre-line">
                                  {result.message.replace(/✅|❌|⚠️/g, '').trim()}
                                </CardDescription>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {result.duration && (
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {result.duration}ms
                                </Badge>
                              )}
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <CardContent className="pt-0">
                          <div className="bg-muted p-4 rounded-md">
                            <pre className="text-xs overflow-auto max-h-96">
                              {JSON.stringify(result.data, null, 2)}
                            </pre>
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pre-Deletion Checklist</CardTitle>
            <CardDescription>
              Verify all items before removing hardcoded data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {passedCount === totalCount ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive" />
                )}
                <span>All integration tests passed ({passedCount}/{totalCount})</span>
              </div>
              <div className="text-sm text-muted-foreground ml-7">
                <p>• Store format validation: "City Name 0XX"</p>
                <p>• Plant format validation: "Plant Name 0XX"</p>
                <p>• Store colors with fallback logic for missing mappings</p>
                <p>• User access control via can_access_ordering flag</p>
              </div>
              
              {passedCount === totalCount ? (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-950 rounded-md border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                    ✅ All tests passed! The OT Platform integration is working correctly.
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                    You can proceed with removing hardcoded data from formConfig.ts
                  </p>
                </div>
              ) : (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-950 rounded-md border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                    ❌ Some tests failed. Please resolve issues before removing hardcoded data.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
