import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { submitToGoogleSheets } from "@/services/sheets";
import { useAuth } from "@/contexts/AuthContext";
import { OrderFormInputs } from "./order-form/OrderFormInputs";
import { OrderSummaryTable } from "./order-form/OrderSummaryTable";
import {
  initialFormData,
  type FormData,
} from "./order-form/formConfig";

interface OrderSummary extends FormData {
  id: string;
  timestamp: string;
  store: string;
  selected?: boolean;
}

export const OrderForm = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSummaries, setOrderSummaries] = useState<OrderSummary[]>([]);
  const [formData, setFormData] = useState<FormData>({
    ...initialFormData,
    dateReceived: new Date().toISOString().slice(0, 16),
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
        dateReceived: new Date().toISOString().slice(0, 16),
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
    const selectedOrders = orderSummaries.filter(order => order.selected);
    
    try {
      for (const order of selectedOrders) {
        await submitToGoogleSheets(order);
        
        const existingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
        existingOrders.push(order);
        localStorage.setItem('pendingOrders', JSON.stringify(existingOrders));
      }
      
      setOrderSummaries(prev => prev.filter(order => !order.selected));
      
      toast({
        title: "Orders Submitted",
        description: `Successfully submitted ${selectedOrders.length} orders.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
        isSubmitting={isSubmitting}
        onToggleSelection={toggleOrderSelection}
        onSubmitSelected={handleSubmitSelected}
      />
    </div>
  );
};