import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { submitToGoogleSheets } from "@/services/sheets";
import { FormField } from "./order-form/FormField";
import {
  stores,
  scheduleOptions,
  crossDockOptions,
  initialFormData,
  type FormData,
} from "./order-form/formConfig";

export const OrderForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await submitToGoogleSheets({
        timestamp: new Date().toLocaleString(),
        ...formData,
      });
      
      toast({
        title: "Order Submitted",
        description: "Your order has been successfully recorded.",
      });
      
      setFormData(initialFormData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">
      <div className="space-y-4">
        <FormField
          label="Your Name"
          required
          value={formData.yourName}
          onChange={(value) => handleChange("yourName", value)}
          placeholder="Enter your name"
        />

        <FormField
          label="Store"
          value={formData.store}
          onChange={(value) => handleChange("store", value)}
          options={stores}
          placeholder="Select store"
        />

        <FormField
          label="Date Received"
          type="datetime-local"
          required
          value={formData.dateReceived}
          onChange={(value) => handleChange("dateReceived", value)}
        />

        <FormField
          label="Product Number"
          required
          value={formData.productNumber}
          onChange={(value) => handleChange("productNumber", value)}
          placeholder="Enter product number"
        />

        <FormField
          label="Description"
          required
          value={formData.description}
          onChange={(value) => handleChange("description", value)}
          placeholder="Enter product description"
        />

        <FormField
          label="Quantity"
          type="number"
          required
          value={formData.quantity}
          onChange={(value) => handleChange("quantity", value)}
          placeholder="Enter quantity"
        />

        <FormField
          label="Schedule Arrival"
          value={formData.scheduleArrival}
          onChange={(value) => handleChange("scheduleArrival", value)}
          options={scheduleOptions}
          placeholder="Select arrival day"
        />

        <FormField
          label="Notes"
          value={formData.notes}
          onChange={(value) => handleChange("notes", value)}
          placeholder="Enter any additional notes"
        />

        <FormField
          label="Cross Dock"
          value={formData.crossDock}
          onChange={(value) => handleChange("crossDock", value)}
          options={crossDockOptions}
          placeholder="Select yes/no"
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Submit Order"}
      </Button>
    </form>
  );
};