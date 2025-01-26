import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { OrderFormInputs } from "./order-form/OrderFormInputs";
import { OrderSummaryTable } from "./order-form/OrderSummaryTable";
import { OrderSubmissionHandler } from "./order-form/OrderSubmissionHandler";
import { getCurrentDateTime } from "@/utils/dateTime";
import {
  initialFormData,
  type FormData,
} from "./order-form/formConfig";
import type { OrderSummary } from "./order-form/types";

export const OrderForm = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [orderSummaries, setOrderSummaries] = useState<OrderSummary[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    ...initialFormData,
    dateReceived: getCurrentDateTime(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const orderData: OrderSummary = {
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleString(),
        ...formData,
        store: user?.store || '',
        selected: false,
      };

      setOrderSummaries(prev => [...prev, orderData]);
      
      toast({
        title: "Order Added to Summary",
        description: "Your order has been added to the summary table below.",
      });
      
      setFormData({
        ...initialFormData,
        dateReceived: getCurrentDateTime(),
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add order to summary. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    if (field === 'dateReceived') return;
    
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleOrderSelection = (orderId: string) => {
    setOrderSummaries(prev =>
      prev.map(order =>
        order.id === orderId
          ? { ...order, selected: !order.selected }
          : order
      )
    );
  };

  const handleSubmitSelected = async () => {
    setIsSubmitting(true);
    try {
      // Your existing submission logic here
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      toast({
        title: "Error",
        description: "Failed to submit orders. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      <OrderFormInputs
        formData={formData}
        onSubmit={handleSubmit}
        onChange={handleChange}
      />
      <OrderSummaryTable
        orderSummaries={orderSummaries}
        onToggleSelection={toggleOrderSelection}
        isSubmitting={isSubmitting}
        onSubmitSelected={handleSubmitSelected}
      />
      <OrderSubmissionHandler
        orderSummaries={orderSummaries}
        setOrderSummaries={setOrderSummaries}
      />
    </div>
  );
};