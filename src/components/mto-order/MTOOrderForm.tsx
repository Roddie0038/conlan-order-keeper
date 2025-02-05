import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { FormField } from "../order-form/FormField";
import { Button } from "@/components/ui/button";
import { stores } from "../order-form/formConfig";

const casingGrades = [
  { value: "A Casing", name: "A Casing" },
  { value: "B Casing", name: "B Casing" },
  { value: "C Casing", name: "C Casing" },
];

const tireSizes = [
  { value: "295/75R22.5", name: "295/75R22.5" },
  { value: "11R22.5", name: "11R22.5" },
  { value: "11R24.5", name: "11R24.5" },
  { value: "custom", name: "Other (Type Below)" },
];

const scheduleOptions = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Will Call Pick Up",
].map(value => ({ value }));

export const MTOOrderForm = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    store: user?.store || "",
    timestamp: new Date().toLocaleString(),
    name: "",
    productNumber: "",
    casingGrade: "",
    tireSize: "",
    customTireSize: "",
    tireTreadNeeded: "",
    quantity: "",
    scheduleArrival: "",
    notes: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log("Submitting MTO order to Zapier webhook");

    try {
      const finalTireSize = formData.tireSize === 'custom' ? formData.customTireSize : formData.tireSize;
      
      const orderData = {
        store: formData.store,
        timestamp: formData.timestamp,
        name: formData.name,
        productNumber: formData.productNumber,
        casingGrade: formData.casingGrade,
        tireSize: finalTireSize,
        tireTreadNeeded: formData.tireTreadNeeded,
        quantity: formData.quantity,
        scheduleArrival: formData.scheduleArrival,
        notes: formData.notes,
        type: 'MTO',
        triggered_from: window.location.origin,
      };

      // Send to Zapier webhook
      await fetch(
        "https://hooks.zapier.com/hooks/catch/21441385/2atp7qy/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          mode: "no-cors",
          body: JSON.stringify(orderData),
        }
      );
      
      console.log("MTO order submitted successfully");
      
      toast({
        title: "Order Submitted Successfully",
        description: "Your MTO order has been submitted.",
      });

      setFormData({
        ...formData,
        name: "",
        productNumber: "",
        casingGrade: "",
        tireSize: "",
        customTireSize: "",
        tireTreadNeeded: "",
        quantity: "",
        scheduleArrival: "",
        notes: "",
      });
    } catch (error) {
      console.error("Error submitting MTO order:", error);
      toast({
        title: "Error",
        description: "Failed to submit order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <div className="space-y-4">
        <FormField
          label="Store"
          value={formData.store}
          onChange={(value) => handleChange("store", value)}
          options={stores}
          placeholder="Select store"
          required
        />

        <FormField
          label="Timestamp"
          value={formData.timestamp}
          onChange={() => {}}
          disabled={true}
        />

        <FormField
          label="Name"
          value={formData.name}
          onChange={(value) => handleChange("name", value)}
          placeholder="Enter your name"
          required
        />

        <FormField
          label="Product Number"
          value={formData.productNumber}
          onChange={(value) => handleChange("productNumber", value)}
          placeholder="Enter product number"
          required
        />

        <FormField
          label="Casing Grade"
          value={formData.casingGrade}
          onChange={(value) => handleChange("casingGrade", value)}
          options={casingGrades}
          placeholder="Select casing grade"
          required
        />

        <FormField
          label="Tire Size"
          value={formData.tireSize}
          onChange={(value) => handleChange("tireSize", value)}
          options={tireSizes}
          placeholder="Select tire size"
          required
        />

        {formData.tireSize === 'custom' && (
          <FormField
            label="Custom Tire Size"
            value={formData.customTireSize}
            onChange={(value) => handleChange("customTireSize", value)}
            placeholder="Enter custom tire size"
            required
          />
        )}

        <FormField
          label="Tire Tread Needed"
          value={formData.tireTreadNeeded}
          onChange={(value) => handleChange("tireTreadNeeded", value)}
          placeholder="Enter tire tread needed"
          required
        />

        <FormField
          label="Quantity"
          type="number"
          value={formData.quantity}
          onChange={(value) => handleChange("quantity", value)}
          placeholder="Enter quantity"
          required
        />

        <FormField
          label="Schedule Arrival"
          value={formData.scheduleArrival}
          onChange={(value) => handleChange("scheduleArrival", value)}
          options={scheduleOptions}
          placeholder="Select arrival day"
          required
        />

        <FormField
          label="Notes"
          value={formData.notes}
          onChange={(value) => handleChange("notes", value)}
          placeholder="Enter any additional notes"
        />
      </div>

      <Button 
        type="submit" 
        className="w-full"
        disabled={isSubmitting}
      >
        Submit MTO Order
      </Button>
    </form>
  );
};