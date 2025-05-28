
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export function WarningCallout() {
  return (
    <Alert className="bg-amber-500/10 border-amber-500/50 text-amber-100">
      <AlertTriangle className="h-5 w-5 text-amber-400" />
      <AlertDescription className="text-amber-200">
        <strong>Important:</strong> MOLD CURE treads may be used as needed for sales — no stock builds allowed.
      </AlertDescription>
    </Alert>
  );
}
