
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface OrderFormActionsProps {
  isSubmitting: boolean;
  selectedPlant: string;
}

export function OrderFormActions({ 
  isSubmitting,
  selectedPlant
}: OrderFormActionsProps) {
  return (
    <div className="mt-8 flex flex-col space-y-4">
      <Button 
        type="submit" 
        className="w-full py-6 rounded-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white 
                 font-semibold text-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01] flex items-center justify-center"
        disabled={isSubmitting}
      >
        <span className="flex items-center gap-2">
          <Plus className="h-5 w-5" /> Add To Order
        </span>
      </Button>
      
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        Your order will be sent to <span className="font-semibold text-blue-600 dark:text-blue-400">{selectedPlant}</span>
      </div>
    </div>
  );
}
