import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { submitToGoogleSheets } from "@/services/sheets";
import { FormField } from "./order-form/FormField";
import { useAuth } from "@/contexts/AuthContext";
import {
  stores,
  scheduleOptions,
  crossDockOptions,
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
      // Submit each selected order
      for (const order of selectedOrders) {
        await submitToGoogleSheets(order);
        
        // Save to pending orders in localStorage
        const existingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
        existingOrders.push(order);
        localStorage.setItem('pendingOrders', JSON.stringify(existingOrders));
      }
      
      // Remove submitted orders from summary
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
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
        <div className="space-y-4">
          <FormField
            label="Your Name"
            required
            value={formData.yourName}
            onChange={(value) => handleChange("yourName", value)}
            placeholder="Enter your name"
          />

          <FormField
            label="Date Received"
            type="datetime-local"
            required
            value={formData.dateReceived}
            onChange={(value) => handleChange("dateReceived", value)}
            disabled={true}
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
        >
          Add to Summary
        </Button>
      </form>

      {orderSummaries.length > 0 && (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2">Select</th>
                  <th className="px-4 py-2">Product</th>
                  <th className="px-4 py-2">Description</th>
                  <th className="px-4 py-2">Quantity</th>
                  <th className="px-4 py-2">Schedule</th>
                </tr>
              </thead>
              <tbody>
                {orderSummaries.map((order) => (
                  <tr key={order.id} className="border-b">
                    <td className="px-4 py-2">
                      <Checkbox
                        checked={order.selected}
                        onCheckedChange={() => toggleOrderSelection(order.id)}
                      />
                    </td>
                    <td className="px-4 py-2">{order.productNumber}</td>
                    <td className="px-4 py-2">{order.description}</td>
                    <td className="px-4 py-2">{order.quantity}</td>
                    <td className="px-4 py-2">{order.scheduleArrival}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              onClick={handleSubmitSelected}
              disabled={isSubmitting || !orderSummaries.some(order => order.selected)}
            >
              {isSubmitting ? "Submitting..." : "Submit Selected Orders"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};