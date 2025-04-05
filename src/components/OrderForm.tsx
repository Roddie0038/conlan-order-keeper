
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { OrderFormInputs } from "./order-form/OrderFormInputs";
import { OrderSummaryTable } from "./order-form/OrderSummaryTable";
import { OrderSubmissionHandler } from "./order-form/OrderSubmissionHandler";
import { getCurrentDateTime } from "@/utils/dateTime";
import { initialFormData, type FormData, stores, storeManagerEmails } from "./order-form/formConfig";
import type { OrderSummary } from "./order-form/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAutoDraft } from "@/hooks/useAutoDraft";
import { OrderTemplate } from "./order-templates/OrderTemplate";
import { Button } from "@/components/ui/button";
import { Search, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { InventoryLookup } from "./inventory/InventoryLookup";

export const OrderForm = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [orderSummaries, setOrderSummaries] = useState<OrderSummary[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionValues, setSessionValues] = useState({
    yourName: "",
    scheduleArrival: ""
  });
  const [formData, setFormData] = useState<FormData>({
    ...initialFormData,
    dateReceived: getCurrentDateTime()
  });
  const [isLookupOpen, setIsLookupOpen] = useState(false);

  // Initialize auto-draft functionality
  const { clearDraft } = useAutoDraft(formData, setFormData);

  const getManagerEmail = (storeName: string) => {
    if (storeName === "Admin") return storeManagerEmails["Admin"];
    const match = storeName.match(/\d+$/);
    if (!match) return "";
    return storeManagerEmails[match[0]] || "";
  };

  useEffect(() => {
    const storedName = sessionStorage.getItem('orderName');
    const storedSchedule = sessionStorage.getItem('orderSchedule');
    if (storedName || storedSchedule) {
      setFormData(prev => ({
        ...prev,
        yourName: storedName || '',
        scheduleArrival: storedSchedule || ''
      }));
      setSessionValues({
        yourName: storedName || '',
        scheduleArrival: storedSchedule || ''
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.yourName) {
      toast({
        title: "Missing Name",
        description: "Please enter your name.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.productNumber) {
      toast({
        title: "Missing Product Number",
        description: "Please enter a product number.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.description) {
      toast({
        title: "Missing Description",
        description: "Please enter a product description.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.quantity) {
      toast({
        title: "Missing Quantity",
        description: "Please enter a quantity.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.scheduleArrival) {
      toast({
        title: "Missing Schedule Arrival",
        description: "Please select an arrival day.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.crossDock) {
      toast({
        title: "Missing Cross Dock Selection",
        description: "Please specify if this is a cross dock order.",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.crossDock === "yes" && !formData.crossDockDestination) {
      toast({
        title: "Missing Cross Dock Destination",
        description: "Please select a cross dock destination.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      let crossDockFullName = formData.crossDockDestination;
      if (formData.crossDock === "yes" && formData.crossDockDestination) {
        const store = stores.find(s => s.id === formData.crossDockDestination);
        if (store) {
          crossDockFullName = `${store.name} (${store.id})`;
        }
      }
      const managersEmail = getManagerEmail(user?.store || '');
      console.log("Setting managers email:", managersEmail, "for store:", user?.store);
      const orderData: OrderSummary = {
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleString(),
        ...formData,
        store: user?.store || '',
        crossDockDestination: crossDockFullName,
        selected: false,
        managersEmail: managersEmail
      };
      setOrderSummaries(prev => [...prev, orderData]);
      toast({
        title: "Order Added to Summary",
        description: "Your order has been added to the summary table below."
      });

      // Clear the draft after successful submission
      clearDraft();

      // Reset form but retain session values
      setFormData({
        ...initialFormData,
        dateReceived: getCurrentDateTime(),
        yourName: sessionValues.yourName,
        scheduleArrival: sessionValues.scheduleArrival
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add order to summary. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    if (field === 'dateReceived') return;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Store name and scheduleArrival in sessionStorage when they change
    if (field === 'yourName') {
      sessionStorage.setItem('orderName', value);
      setSessionValues(prev => ({
        ...prev,
        yourName: value
      }));
    }
    if (field === 'scheduleArrival') {
      sessionStorage.setItem('orderSchedule', value);
      setSessionValues(prev => ({
        ...prev,
        scheduleArrival: value
      }));
    }
  };

  const toggleOrderSelection = (orderId: string) => {
    setOrderSummaries(prev => prev.map(order => order.id === orderId ? {
      ...order,
      selected: !order.selected
    } : order));
  };

  const handleLoadTemplate = (templateData: FormData) => {
    setFormData({
      ...templateData,
      dateReceived: getCurrentDateTime() // Always use current date
    });
    toast({
      title: "Template Loaded",
      description: "The template has been loaded successfully."
    });
  };

  const handleLookupSelect = (productNumber: string, description: string) => {
    setFormData(prev => ({
      ...prev,
      productNumber,
      description
    }));
    setIsLookupOpen(false);
    toast({
      title: "Product Selected",
      description: `${productNumber} - ${description} has been added to the form.`
    });
  };

  return (
    <div className="space-y-8">
      <Tabs defaultValue="order-form" className="w-full">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="order-form" className="font-medium text-sm rounded-xl bg-amber-300/90 hover:bg-amber-300 text-black p-4 flex items-center gap-2 shadow-lg">
            <AlertTriangle className="h-5 w-5 text-amber-700" />
            <span>For any orders exceeding 50 retread tires, please submit an MTO order to guarantee we can fulfill the complete request. If you're ordering more than 50 new tires, you can place the order here.</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="order-form" className="bg-transparent">
          <div className="mb-6 bg-black/40 backdrop-blur-sm p-6 rounded-xl border border-gray-800 transition-all shadow-lg">
            <h3 className="mb-4 text-white text-center font-bold text-2xl">Order Templates</h3>
            <OrderTemplate type="regular" currentData={formData} onLoadTemplate={handleLoadTemplate} />
          </div>

          <div className="mb-6 flex justify-end">
            <Dialog open={isLookupOpen} onOpenChange={setIsLookupOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-500 transition-colors shadow-md rounded-lg">
                  <Search className="w-4 h-4 mr-2" />
                  Inventory Lookup
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl w-full">
                <InventoryLookup onSelect={handleLookupSelect} />
              </DialogContent>
            </Dialog>
          </div>
          
          <OrderFormInputs formData={formData} onSubmit={handleSubmit} onChange={handleChange} />
          
          <div className="mt-10">
            <OrderSummaryTable orderSummaries={orderSummaries} onToggleSelection={toggleOrderSelection} />
            <OrderSubmissionHandler orderSummaries={orderSummaries} setOrderSummaries={setOrderSummaries} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
