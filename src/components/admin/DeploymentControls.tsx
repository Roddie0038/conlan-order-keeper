import { useState } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Rocket, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { triggerProductionDeployment } from "@/services/deploymentService";

export function DeploymentControls() {
  const { user } = useAuth();
  const [isDeploying, setIsDeploying] = useState(false);
  const [lastDeployedTime, setLastDeployedTime] = useState<string | null>(null);
  
  // Only show to Conlan97
  if (user?.username !== 'Conlan97') {
    return null;
  }

  const handleDeployment = async () => {
    setIsDeploying(true);
    
    try {
      const { success, message } = await triggerProductionDeployment();
      
      if (success) {
        setLastDeployedTime(new Date().toLocaleTimeString());
        toast.success("Deployment Triggered Successfully", {
          description: "Your changes are being deployed to production.",
        });
      } else {
        throw new Error(message);
      }
    } catch (error) {
      console.error("Deployment error:", error);
      toast.error("Deployment Failed", {
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <Card className="bg-slate-800 border-amber-500">
      <CardHeader>
        <CardTitle className="text-xl text-amber-400 flex items-center gap-2">
          <Rocket className="h-5 w-5" />
          Deployment Controls
        </CardTitle>
        <CardDescription className="text-slate-300">
          Deploy your changes to the production environment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="p-4 bg-slate-700 rounded-md border border-slate-600">
            <h3 className="font-semibold mb-2 text-white">Deployment Pipeline</h3>
            <ul className="list-disc list-inside text-sm text-slate-300 space-y-2">
              <li>Development Branch (<span className="text-green-400">dev</span>) → Preview/Testing</li>
              <li>Main Branch (<span className="text-amber-400">main</span>) → Production</li>
              <li>All production deploys must be triggered manually</li>
            </ul>
          </div>

          <p className="text-sm text-slate-300">
            Trigger a manual deployment to the production environment (main branch).
            {lastDeployedTime && (
              <span className="block mt-2 text-amber-400">
                <CheckCircle className="inline h-4 w-4 mr-1" /> 
                Last deployed at: {lastDeployedTime}
              </span>
            )}
          </p>
          
          <Button
            variant="default" 
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
            onClick={handleDeployment}
            disabled={isDeploying}
          >
            {isDeploying ? (
              <>
                <span className="animate-spin mr-2 inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                Deploying...
              </>
            ) : (
              <>
                <Rocket className="mr-2 h-4 w-4" />
                Publish to Production
              </>
            )}
          </Button>
        </div>
      </CardContent>
      <CardFooter className="text-xs text-slate-400 pt-2 flex-col items-start">
        <p>Note: This will deploy the current main branch to production.</p>
        <p className="mt-1">Only authorized users (Conlan97) can trigger deployments.</p>
      </CardFooter>
    </Card>
  );
}
