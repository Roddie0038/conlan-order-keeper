import { CheckCircle, Clock, WifiOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface FormRestorationBannerProps {
  isRestoring: boolean;
  lastSaved?: Date | null;
  onClearData?: () => void;
  saveCount?: number;
}

export function FormRestorationBanner({ 
  isRestoring, 
  lastSaved, 
  onClearData,
  saveCount = 0 
}: FormRestorationBannerProps) {
  if (!isRestoring && !lastSaved) return null;

  if (isRestoring) {
    return (
      <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
        <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          Restoring your previous work...
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
      <AlertDescription className="text-green-800 dark:text-green-200 flex items-center justify-between">
        <div>
          Your form data is being auto-saved securely.
          {lastSaved && (
            <span className="ml-2 text-green-600 dark:text-green-400">
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
          {saveCount > 0 && (
            <span className="ml-2 text-xs text-green-500 dark:text-green-500">
              ({saveCount} saves)
            </span>
          )}
        </div>
        {onClearData && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearData}
            className="h-6 px-2 text-xs text-green-700 hover:text-green-900 dark:text-green-300 dark:hover:text-green-100"
          >
            Clear
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}