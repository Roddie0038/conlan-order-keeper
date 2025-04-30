
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "../../order-form-schema";
import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { CrossDockDestinationField } from "./CrossDockDestinationField";
import { ReceiverNoField } from "./ReceiverNoField";
import { ETADateField } from "./ETADateField";
import { CrossDockConfirmationField } from "./CrossDockConfirmationField";
import { PrintFormButton } from "./PrintFormButton";

interface CrossDockFormDetailsProps {
  form: UseFormReturn<OrderFormValues>;
  onPrintForm?: () => void;
}

export function CrossDockFormDetails({ form, onPrintForm }: CrossDockFormDetailsProps) {
  return (
    <Card className="mt-4 p-4 border border-purple-200 bg-purple-50 dark:bg-purple-900/20">
      <div className="mb-4 border-b border-purple-200 pb-2">
        <h4 className="text-md font-medium text-purple-700 dark:text-purple-300 flex items-center">
          <FileText className="h-4 w-4 mr-2" />
          Cross Dock Form Details
        </h4>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CrossDockDestinationField form={form} />
        <ReceiverNoField form={form} />
        <ETADateField form={form} />
      </div>
      
      <div className="mt-4">
        <CrossDockConfirmationField form={form} />
      </div>
      
      <div className="mt-4 flex justify-end">
        <PrintFormButton onPrintForm={onPrintForm} />
      </div>
    </Card>
  );
}
