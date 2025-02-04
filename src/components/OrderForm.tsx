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
  stores,
} from "./order-form/formConfig";
import type { OrderSummary } from "./order-form/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
      // Find the full store name for cross dock destination if it exists
      let crossDockFullName = formData.crossDockDestination;
      if (formData.crossDock === "yes" && formData.crossDockDestination) {
        const store = stores.find(s => s.id === formData.crossDockDestination);
        if (store) {
          crossDockFullName = `${store.name} (${store.id})`;
        }
      }

      const orderData: OrderSummary = {
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleString(),
        ...formData,
        store: user?.store || '',
        crossDockDestination: crossDockFullName,
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

  return (
    <div className="space-y-8">
      <Tabs defaultValue="order-form" className="w-full">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="order-form" className="font-bold text-red-600">For any orders exceeding 50 retread tires, please submit an MTO order to guarantee we can fulfill the complete request. If you're ordering more than 50 new tires, you can place the order here.</TabsTrigger>
        </TabsList>
        <TabsContent value="order-form">
          <OrderFormInputs
            formData={formData}
            onSubmit={handleSubmit}
            onChange={handleChange}
          />
          <OrderSummaryTable
            orderSummaries={orderSummaries}
            onToggleSelection={toggleOrderSelection}
          />
          <OrderSubmissionHandler
            orderSummaries={orderSummaries}
            setOrderSummaries={setOrderSummaries}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};