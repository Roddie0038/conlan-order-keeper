
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { submitToGoogleSheets } from "@/services/sheets";
import { stores, getManagerEmail } from "@/components/order-form/formConfig";
import { Truck, User, Calendar, ShoppingCart, Palette, Gauge, CircleUser } from "lucide-react";
import { WheelFormInputs } from "./WheelFormInputs";
import { WheelFormData } from "./types";

export function WheelOrderForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [managerEmail, setManagerEmail] = useState("");
  
  const [formData, setFormData] = useState<WheelFormData>({
    yourName: "",
    storeName: user?.store || "",
    storeId: "", 
    dateReceived: new Date().toISOString().split("T")[0],
    qtyWheels: "",
    customerName: "",
    wheelMaterial: "",
    wheelType: "",
    handHoles: "",
    wheelSize: "",
    wheelColor: "",
  });

  useEffect(() => {
    if (user?.store) {
      const storeIdMatch = user.store.match(/\d+$/);
      const storeId = storeIdMatch ? storeIdMatch[0] : "";
      
      const storeObj = stores.find(s => s.id === storeId);
      
      if (storeObj) {
        setFormData(prev => ({
          ...prev,
          storeName: user.store,
          storeId: storeId
        }));
      }

      const email = getManagerEmail(user.store);
      setManagerEmail(email);
    }
  }, [user?.store]);
  
  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStoreChange = (value: string) => {
    if (!user?.isAdmin) return;

    const selectedStore = stores.find(store => store.id === value);
    if (selectedStore) {
      setFormData(prev => ({ 
        ...prev, 
        storeId: value,
        storeName: selectedStore.name
      }));
      
      const email = getManagerEmail(selectedStore.name);
      setManagerEmail(email);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.yourName) {
      toast({
        title: "Missing Name",
        description: "Please enter your name.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (!formData.storeId) {
      toast({
        title: "Missing Store",
        description: "Please select a store.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (!formData.qtyWheels) {
      toast({
        title: "Missing Quantity",
        description: "Please enter quantity of wheels.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const submissionData = {
        yourName: formData.yourName,
        store: formData.storeName,
        storeId: formData.storeId,
        dateReceived: formData.dateReceived,
        type: "WHEEL_POWDER_COATING",
        
        productNumber: "WHEEL-COATING",
        description: `Wheel coating - ${formData.wheelColor} - ${formData.wheelSize}`,
        quantity: formData.qtyWheels,
        scheduleArrival: formData.dateReceived,
        notes: `Customer: ${formData.customerName}, Material: ${formData.wheelMaterial}, Type: ${formData.wheelType}, Hand Holes: ${formData.handHoles}`,
        crossDock: "No",
        managersEmail: managerEmail,
        
        qtyWheels: formData.qtyWheels,
        customerName: formData.customerName,
        wheelMaterial: formData.wheelMaterial,
        wheelType: formData.wheelType,
        handHoles: formData.handHoles,
        wheelSize: formData.wheelSize,
        wheelColor: formData.wheelColor,
        timestamp: new Date().toISOString(),
      };

      console.log("Submitting wheel order with manager email:", managerEmail);

      const result = await submitToGoogleSheets(submissionData);
      
      if (result.status === 'success' || result.status === 'partial_success') {
        const existingOrders = JSON.parse(localStorage.getItem('wheelOrders') || '[]');
        existingOrders.push({
          ...submissionData,
          id: crypto.randomUUID()
        });
        localStorage.setItem('wheelOrders', JSON.stringify(existingOrders));

        toast({
          title: "Order Submitted",
          description: "Your wheel powder coating order has been submitted successfully.",
        });
        navigate('/dashboard');
      } else {
        throw new Error("Failed to submit order");
      }
    } catch (error) {
      console.error("Error submitting wheel order:", error);
      toast({
        title: "Error",
        description: "There was a problem submitting your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto bg-white shadow-xl transition-all duration-300 hover:shadow-2xl">
      <CardHeader className="p-0 overflow-hidden rounded-t-lg">
        <div 
          className="relative p-6 text-white"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.6)), url('/lovable-uploads/9016d384-d388-4e10-98bc-386878e11d27.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '160px'
          }}
        >
          <CardTitle className="text-2xl font-bold tracking-tight text-white z-10 relative">
            WHEEL POWDER COATING ORDER
          </CardTitle>
          <CardDescription className="text-blue-100 font-medium mt-2 z-10 relative">
            Complete the form below to submit a wheel powder coating order
          </CardDescription>
        </div>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="p-8">
          <WheelFormInputs 
            formData={formData}
            managerEmail={managerEmail}
            onInputChange={handleInputChange}
            onStoreChange={handleStoreChange}
            user={user}
          />
        </CardContent>
        
        <CardFooter className="flex justify-end gap-4 pb-6 px-6 border-t border-gray-100 pt-6">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="border-red-300 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-400 transition-all duration-200"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-medium transition-all duration-200 hover:shadow-md"
          >
            {isSubmitting ? "Submitting..." : "Submit Order"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
