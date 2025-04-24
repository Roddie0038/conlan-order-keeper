
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Environment, currentEnvironment } from "@/config/environment";

export function EnvironmentSwitcher() {
  const [env, setEnv] = useState<Environment>(currentEnvironment);
  
  const handleChange = (value: Environment) => {
    if (value) {
      setEnv(value);
      
      // Add environment to localStorage for persistence
      localStorage.setItem('app-environment', value);
      
      // Add URL parameter for build systems to detect
      const url = new URL(window.location.href);
      url.searchParams.set('env', value);
      
      // Reload the page to apply the environment change
      if (confirm(`Switch to ${value} environment? The page will reload.`)) {
        window.location.href = url.toString();
      }
    }
  };
  
  // Check URL parameters for environment override
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const envParam = urlParams.get('env') as Environment | null;
    
    if (envParam && (envParam === 'production' || envParam === 'staging')) {
      setEnv(envParam);
    }
  }, []);
  
  return (
    <div className="p-4 bg-white rounded-lg shadow-md border border-gray-200">
      <h3 className="text-sm font-medium mb-2 text-gray-700">Environment</h3>
      <ToggleGroup type="single" value={env} onValueChange={handleChange}>
        <ToggleGroupItem value="production" aria-label="Production Environment">
          Production
        </ToggleGroupItem>
        <ToggleGroupItem value="staging" aria-label="Staging Environment">
          Staging
        </ToggleGroupItem>
      </ToggleGroup>
      <p className="text-xs text-gray-500 mt-2">
        Current: <span className="font-medium">{env}</span>
      </p>
    </div>
  );
}
