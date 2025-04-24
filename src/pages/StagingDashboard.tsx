import { FeatureFlagDebug } from "@/components/environment/FeatureFlagDebug";
import { isStaging } from "@/config/environment";
import { TestingChecklist } from "@/components/testing/TestingChecklist";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { EnvironmentSwitcher } from "@/components/environment/EnvironmentSwitcher";

export default function StagingDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("overview");
  
  // Only accessible in staging environment
  if (!isStaging) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-3xl font-bold mb-6">Staging Dashboard</h1>
        <div className="p-8 bg-gray-100 rounded-lg">
          <div className="text-red-600 text-xl mb-4">
            ⚠️ This page is only available in the staging environment
          </div>
          <p className="text-gray-700 mb-8">
            To access the staging dashboard, please switch to the staging environment.
          </p>
          <div className="max-w-xs mx-auto">
            <EnvironmentSwitcher />
          </div>
        </div>
      </div>
    );
  }
  
  const testErrors = () => {
    toast({
      variant: "destructive",
      title: "Error Test",
      description: "This is a test error notification"
    });
  };
  
  const testWarning = () => {
    toast({
      variant: "warning",
      title: "Warning Test",
      description: "This is a test warning notification"
    });
  };
  
  const testSuccess = () => {
    toast({
      title: "Success Test",
      description: "This is a test success notification"
    });
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Staging Dashboard</h1>
        <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
          STAGING ENVIRONMENT
        </Badge>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="features">Feature Tests</TabsTrigger>
          <TabsTrigger value="components">UI Components</TabsTrigger>
          <TabsTrigger value="tools">Testing Tools</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Environment Information</h2>
              <div className="grid grid-cols-2 gap-2 mb-6">
                <div className="text-gray-500">Environment:</div>
                <div className="font-medium">Staging</div>
                <div className="text-gray-500">API URL:</div>
                <div className="font-medium">https://your-staging-project.supabase.co</div>
                <div className="text-gray-500">Build Date:</div>
                <div className="font-medium">{new Date().toLocaleDateString()}</div>
              </div>
              
              <EnvironmentSwitcher />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Testing Status</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Authentication Features</span>
                    <span>2/3</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '66%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Order Features</span>
                    <span>1/3</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '33%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Inventory Features</span>
                    <span>3/3</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="features" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <TestingChecklist feature="auth" />
            <TestingChecklist feature="orders" />
            <TestingChecklist feature="inventory" />
            <TestingChecklist feature="cross-dock" />
          </div>
        </TabsContent>
        
        <TabsContent value="components" className="space-y-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Toast Notifications</h2>
            <div className="flex flex-wrap gap-4">
              <Button onClick={testSuccess}>Test Success Toast</Button>
              <Button onClick={testWarning} variant="outline" className="border-yellow-500 text-yellow-700">
                Test Warning Toast
              </Button>
              <Button onClick={testErrors} variant="destructive">Test Error Toast</Button>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Feature Flags</h2>
            <div className="max-w-full">
              <FeatureFlagDebug />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="tools" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Database Tools</h2>
              <div className="space-y-4">
                <Button className="w-full">Reset Test Data</Button>
                <Button className="w-full" variant="outline">Copy Production Data to Staging</Button>
                <Button className="w-full" variant="outline">Clear All Data</Button>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Testing Utilities</h2>
              <div className="space-y-4">
                <Button className="w-full">Generate Test Orders</Button>
                <Button className="w-full" variant="outline">Simulate Low Inventory</Button>
                <Button className="w-full" variant="outline">Test Notifications</Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
