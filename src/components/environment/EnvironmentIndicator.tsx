
import { isStaging } from "@/config/environment";
import { cn } from "@/lib/utils";

interface EnvironmentIndicatorProps {
  className?: string;
}

export function EnvironmentIndicator({ className }: EnvironmentIndicatorProps) {
  // Only show in staging environment
  if (!isStaging) return null;
  
  return (
    <div 
      className={cn(
        "fixed bottom-4 right-4 bg-amber-500 text-white px-3 py-1 rounded-md shadow-md z-50 font-medium text-sm",
        className
      )}
    >
      STAGING
    </div>
  );
}
