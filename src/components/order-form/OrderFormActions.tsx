
import { Button } from "@/components/ui/button";

interface OrderFormActionsProps {
  isSubmitting: boolean;
  selectedPlant: string;
  onAddClick?: () => void;
}

export function OrderFormActions({ 
  isSubmitting,
  selectedPlant,
  onAddClick
}: OrderFormActionsProps) {
  return (
    <div className="mt-8 flex flex-col space-y-4">
      <Button
        liveEditCompatible
        data-editable="primary-action"
        data-editable-group="new-order-form"
        data-live-edit="true"
        data-live-targets="background,color,border-radius"
        data-style-bg=""
        data-style-fg=""
        data-style-radius=""
        className="btn-live-edit w-full py-6 text-lg font-semibold shadow-lg live-edit-hint"
        disabled={isSubmitting}
        onClick={onAddClick}
      >
        {isSubmitting ? "Adding..." : " Order"}
      </Button>
      
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        Your order will be sent to <span className="font-semibold text-blue-600 dark:text-blue-400">{selectedPlant}</span>
      </div>
    </div>
  );
}
