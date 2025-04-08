
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "./order-form-schema";
import { Form } from "@/components/ui/form";
import { ContactSection } from "./sections/ContactSection";
import { ProductSection } from "./sections/ProductSection";
import { ScheduleSection } from "./sections/ScheduleSection";
import { CrossDockSection } from "./sections/CrossDockSection";

interface OrderFormContentProps {
  form: UseFormReturn<OrderFormValues>;
  showCrossDockDestination: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function OrderFormContent({ 
  form, 
  showCrossDockDestination,
  onSubmit 
}: OrderFormContentProps) {
  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Contact Information */}
        <ContactSection form={form} />
        
        {/* Order Details */}
        <ProductSection form={form} />
        
        {/* Logistics */}
        <ScheduleSection form={form} />
        
        {/* Cross Dock */}
        <CrossDockSection 
          form={form} 
          showCrossDockDestination={showCrossDockDestination} 
        />
      </form>
    </Form>
  );
}
