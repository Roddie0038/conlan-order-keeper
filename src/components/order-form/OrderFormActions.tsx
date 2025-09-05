
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface OrderFormActionsProps {
  isSubmitting: boolean;
  selectedPlant: string;
  onAddClick?: () => void; // New prop to handle the add to order action
}

export function OrderFormActions({ 
  isSubmitting,
  selectedPlant,
  onAddClick
}: OrderFormActionsProps) {
  return (
    <div className="mt-8 flex flex-col space-y-4">
      <Button 
        type="button"
        className="w-full py-6 live-edit-button font-semibold text-lg flex items-center justify-center"
        disabled={isSubmitting}
        onClick={onAddClick}
        data-editable-background="true"
        data-editable-color="true"
        data-editable-border="true"
        data-editable-border-radius="true"
        style={{
          background: 'hsl(var(--button-bg-color))',
          color: 'hsl(var(--button-text-color))',
          borderRadius: 'var(--button-border-radius)',
          border: '1px solid hsl(var(--button-border-color))',
          boxShadow: '0 10px 30px -10px hsl(var(--button-shadow-color) / 0.3)'
        }}
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
