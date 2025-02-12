import { useState, useEffect } from "react";
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
  storeManagerEmails,
} from "./order-form/formConfig";
import type { OrderSummary } from "./order-form/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const OrderForm = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [orderSummaries, setOrderSummaries] = useState<OrderSummary[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionValues, setSessionValues] = useState({
    yourName: "",
    scheduleArrival: "",
  });
  
  const [formData, setFormData] = useState<FormData>({
    ...initialFormData,
    dateReceived: getCurrentDateTime(),
  });

  const getManagerEmail = (storeName: string) => {
    if (storeName === "Admin") return storeManagerEmails["Admin"];
    
    // Match the store number at the end of the string
    const match = storeName.match(/\d+$/);
    if (!match) return "";
    
    return storeManagerEmails[match[0]] || "";
  };

  // Load retained values when component mounts
  useEffect(() => {
    const storedName = sessionStorage.getItem('orderName');
    const storedSchedule = sessionStorage.getItem('orderSchedule');
    
    if (storedName || storedSchedule) {
      setFormData(prev => ({
        ...prev,
        yourName: storedName || '',
        scheduleArrival: storedSchedule || '',
      }));
      setSessionValues({
        yourName: storedName || '',
        scheduleArrival: storedSchedule || '',
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let crossDockFullName = formData.crossDockDestination;
      if (formData.crossDock === "yes" && formData.crossDockDestination) {
        const store = stores.find(s => s.id === formData.crossDockDestination);
        if (store) {
          crossDockFullName = `${store.name} (${store.id})`;
        }
      }

      const managerEmail = getManagerEmail(user?.store || '');
      console.log("Setting manager email:", managerEmail, "for store:", user?.store);

      const orderData: OrderSummary = {
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleString(),
        ...formData,
        store: user?.store || '',
        crossDockDestination: crossDockFullName,
        selected: false,
        managerEmail: managerEmail,
      };

      setOrderSummaries(prev => [...prev, orderData]);
      
      toast({
        title: "Order Added to Summary",
        description: "Your order has been added to the summary table below.",
      });
      
      // Reset form but retain session values
      setFormData({
        ...initialFormData,
        dateReceived: getCurrentDateTime(),
        yourName: sessionValues.yourName,
        scheduleArrival: sessionValues.scheduleArrival,
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

    // Store name and scheduleArrival in sessionStorage when they change
    if (field === 'yourName') {
      sessionStorage.setItem('orderName', value);
      setSessionValues(prev => ({ ...prev, yourName: value }));
    }
    if (field === 'scheduleArrival') {
      sessionStorage.setItem('orderSchedule', value);
      setSessionValues(prev => ({ ...prev, scheduleArrival: value }));
    }
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
          <TabsTrigger 
            value="order-form" 
            className="font-bold text-red-600 text-sm bg-[#40E0D0] hover:bg-[#40E0D0]/90"
          >
            For any orders exceeding 50 retread tires, please submit an MTO order to guarantee we can fulfill the complete request. If you're ordering more than 50 new tires, you can place the order here.
          </TabsTrigger>
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
