import { CheckCircle, Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FormRestorationBannerProps {
  isRestoring: boolean;
  lastSaved?: Date | null;
}

export function FormRestorationBanner({ isRestoring, lastSaved }: FormRestorationBannerProps) {
  if (!isRestoring && !lastSaved) return null;

  if (isRestoring) {
    return (
      <Alert className="bg-blue-50 border-blue-200">
        <Clock className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          Restoring your previous work...
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="bg-green-50 border-green-200">
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertDescription className="text-green-800">
        Your form data is being auto-saved as you type.
        {lastSaved && (
          <span className="ml-2 text-green-600">
            Last saved: {lastSaved.toLocaleTimeString()}
          </span>
        )}
      </AlertDescription>
    </Alert>
  );
}