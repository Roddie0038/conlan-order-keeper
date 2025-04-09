
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface OrderFormActionsProps {
  isSubmitting: boolean;
  selectedPlant: string;
}

export function OrderFormActions({ isSubmitting, selectedPlant }: OrderFormActionsProps) {
  return (
    <div>
      {/* Plant info display */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600 flex items-center">
          <span className="font-medium mr-2">Selected Plant:</span> {selectedPlant}
        </p>
      </div>
      
      <Button 
        type="submit" 
        className="w-full py-6 text-lg" 
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
          </>
        ) : (
          "Submit Order"
        )}
      </Button>
    </div>
  );
}
