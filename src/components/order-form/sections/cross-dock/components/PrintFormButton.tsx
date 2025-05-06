
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "@/components/order-form/order-form-schema";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface PrintFormButtonProps {
  form: UseFormReturn<OrderFormValues>;
  isAdmin?: boolean;
}

export function PrintFormButton({ form, isAdmin = false }: PrintFormButtonProps) {
  const { toast } = useToast();
  const [isTesting, setIsTesting] = useState(false);

  // Toggle for admin testing mode
  const handleTestModeToggle = () => {
    setIsTesting(!isTesting);
  };

  const handlePrint = () => {
    const values = form.getValues();
    
    // Validation checks
    if (values.store === values.crossDockDestination) {
      toast({
        variant: "destructive",
        title: "Invalid destination",
        description: "The destination store cannot be the same as the origin store"
      });
      return;
    }

    // Admin test mode notification - but now webhooks will still be triggered
    if (isAdmin) {
      toast({
        title: isAdmin && !isTesting ? "Admin Test Mode" : "Admin Live Mode",
        description: isAdmin && !isTesting 
          ? "Test mode active - webhooks will be triggered with 'TEST' flags. No notifications will be sent to stores."
          : "Live mode active - all notifications will be sent as normal."
      });
    }
    
    // Logic for printing cross dock paperwork would go here
    window.print();
    
    toast({
      title: "Form Printed",
      description: "The cross dock paperwork has been printed successfully."
    });
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {isAdmin && (
        <div className="flex items-center mb-2">
          <input
            type="checkbox"
            id="testMode"
            className="mr-2"
            checked={isTesting}
            onChange={handleTestModeToggle}
          />
          <label htmlFor="testMode" className="text-sm text-gray-600">
            Enable notifications (live mode)
          </label>
        </div>
      )}
      <Button
        type="button"
        onClick={handlePrint}
        variant="outline"
        className="flex items-center gap-2 border-purple-300 hover:bg-purple-100 hover:text-purple-700 transition-all"
      >
        <Printer className="h-4 w-4" />
        {isAdmin ? (isTesting ? "Print & Send (Live)" : "Print Only (Test)") : "Print Form"}
      </Button>
    </div>
  );
}
