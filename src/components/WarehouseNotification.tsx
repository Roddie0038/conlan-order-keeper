
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export const WarehouseNotification = () => {
  return (
    <Alert variant="default" className="mb-6 bg-yellow-50 border-yellow-300">
      <AlertCircle className="h-5 w-5 text-yellow-600" />
      <AlertTitle className="text-yellow-800">Important Notice</AlertTitle>
      <AlertDescription className="text-yellow-700">
        Please note: The login screen has been updated. Users must now select the correct warehouse before placing orders. 
        Make sure to review your selection to ensure accurate processing.
      </AlertDescription>
    </Alert>
  );
};
