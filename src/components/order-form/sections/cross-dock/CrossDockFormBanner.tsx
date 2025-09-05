import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

export function CrossDockFormBanner() {
  return (
    <Alert className="mb-6 border-blue-200 bg-blue-50 text-blue-800">
      <Info className="h-4 w-4" />
      <AlertDescription>
        <strong>Creating Cross-Dock</strong> — This is for stores shipping cross-dock only, not stores receiving cross-dock.
      </AlertDescription>
    </Alert>
  );
}