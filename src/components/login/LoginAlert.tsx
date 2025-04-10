
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export const LoginAlert = () => {
  return (
    <Alert className="border-amber-600 bg-amber-50/20 text-amber-100">
      <AlertTriangle className="h-4 w-4 text-amber-400 mr-2" />
      <AlertDescription className="text-sm">
        Please note: The login screen has been updated. Users must now select the correct warehouse before placing orders. Make sure to review your selection to ensure accurate processing.
      </AlertDescription>
    </Alert>
  );
};
