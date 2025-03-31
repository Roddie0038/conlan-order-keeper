
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { submitToGoogleSheets } from "@/services/sheets";
import { stores, getManagerEmail } from "@/components/order-form/formConfig";
import { Disc } from "lucide-react";
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
    storeId: "", // We'll set this based on user.store
    dateReceived: new Date().toISOString().split("T")[0],
    qtyWheels: "",
    customerName: "",
    wheelMaterial: "",
    wheelType: "",
    handHoles: "",
    wheelSize: "",
    wheelColor: "",
  });

  // Initialize store ID and manager email when user info is available
  useEffect(() => {
    if (user?.store) {
      // Extract store ID from user.store (e.g., "Fort Worth 22" -> "22")
      const storeIdMatch = user.store.match(/\d+$/);
      const storeId = storeIdMatch ? storeIdMatch[0] : "";
      
      // Find the store in the stores array
      const storeObj = stores.find(s => s.id === storeId);
      
      if (storeObj) {
        setFormData(prev => ({
          ...prev,
          storeName: user.store,
          storeId: storeId
        }));
      }

      // Set manager email
      const email = getManagerEmail(user.store);
      setManagerEmail(email);
    }
  }, [user?.store]);
  
  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStoreChange = (value: string) => {
    // Only admin users can change the store
    if (!user?.isAdmin) return;

    const selectedStore = stores.find(store => store.id === value);
    if (selectedStore) {
      setFormData(prev => ({ 
        ...prev, 
        storeId: value,
        storeName: selectedStore.name
      }));
      
      // Update manager email when store changes
      const email = getManagerEmail(selectedStore.name);
      setManagerEmail(email);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate required fields
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
      // Create a compatible object for submitToGoogleSheets
      const submissionData = {
        yourName: formData.yourName,
        store: formData.storeName,
        storeId: formData.storeId,
        dateReceived: formData.dateReceived,
        type: "WHEEL_POWDER_COATING",
        
        // Add required fields for OrderData
        productNumber: "WHEEL-COATING",
        description: `Wheel coating - ${formData.wheelColor} - ${formData.wheelSize}`,
        quantity: formData.qtyWheels,
        scheduleArrival: formData.dateReceived,
        notes: `Customer: ${formData.customerName}, Material: ${formData.wheelMaterial}, Type: ${formData.wheelType}, Hand Holes: ${formData.handHoles}`,
        crossDock: "No",
        managersEmail: managerEmail,
        
        // Additional wheel specific details
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

      // Submit the form data
      const result = await submitToGoogleSheets(submissionData);
      
      if (result.status === 'success' || result.status === 'partial_success') {
        // Store in localStorage
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
    <Card className="w-full max-w-3xl mx-auto bg-white shadow-xl">
      <CardHeader className="bg-[#2F9599] rounded-t-lg">
        <div className="flex items-center gap-3">
          <Disc size={28} className="text-black" />
          <CardTitle className="text-2xl font-bold tracking-tight text-black">WHEEL POWDER COATING ORDER</CardTitle>
        </div>
        <CardDescription className="text-black">
          Complete the form below to submit a wheel powder coating order
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="p-6">
          <WheelFormInputs 
            formData={formData}
            managerEmail={managerEmail}
            onInputChange={handleInputChange}
            onStoreChange={handleStoreChange}
            user={user}
          />
        </CardContent>
        
        <CardFooter className="flex justify-end gap-4 pb-6 px-6">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="border-red-300 text-red-300 hover:bg-red-300/20"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-[#2F9599] hover:bg-[#267376] transition-colors"
          >
            {isSubmitting ? "Submitting..." : "Submit Order"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
