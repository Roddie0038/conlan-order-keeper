import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePlant } from "@/contexts/PlantContext";
import { useToast } from "@/components/ui/use-toast";
import { submitToGoogleSheets } from "@/services/sheets";
import { stores, getManagerEmail } from "@/components/order-form/formConfig";
import { WheelFormData } from "../types";
import { WEBHOOK_URLS } from "@/services/webhook/config";

export function useWheelOrderForm() {
  const { user } = useAuth();
  const { selectedPlant } = usePlant();
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
    if (!user?.isAdmin) {
      toast({
        title: "Unauthorized",
        description: "You can only submit orders for your own store.",
        variant: "destructive",
      });
      return;
    }

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

    if (!user?.isAdmin && formData.storeName !== user?.store) {
      toast({
        title: "Unauthorized",
        description: "You can only submit orders for your own store.",
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
      console.log("🔍 WHEEL FORM - Preparing wheel order submission");
      console.log("🔍 WHEEL FORM - Verifying webhook URL from config:");
      console.log("🔍 WHEEL FORM - Target webhook URL will be:", WEBHOOK_URLS.WHEEL_ORDERS);
      console.log("🔍 WHEEL FORM - Expected URL: https://script.google.com/macros/s/AKfycbw_PHHn33ELTWnvQHG49VWew18L11EKaF0nHbMFLZvT2C_CNOLs-smLd4aHNxDF7CIEQA/exec");
      console.log("🔍 WHEEL FORM - URLs match?", WEBHOOK_URLS.WHEEL_ORDERS === "https://script.google.com/macros/s/AKfycbw_PHHn33ELTWnvQHG49VWew18L11EKaF0nHbMFLZvT2C_CNOLs-smLd4aHNxDF7CIEQA/exec");
      
      const submissionData = {
        yourName: formData.yourName,
        store: formData.storeName,
        storeId: formData.storeId,
        dateReceived: formData.dateReceived,
        type: "WHEEL_POWDER_COATING" as const,
        productNumber: "WHEEL-COATING",
        description: `Wheel coating - ${formData.wheelColor} - ${formData.wheelSize}`,
        quantity: formData.qtyWheels,
        scheduleArrival: formData.scheduleArrival || formData.dateReceived,
        notes: `Customer: ${formData.customerName}, Material: ${formData.wheelMaterial}, Type: ${formData.wheelType}, Hand Holes: ${formData.handHoles}`,
        crossDock: "No",
        managersEmail: managerEmail,
        managerEmail: managerEmail,
        plant: selectedPlant,
        qtyWheels: formData.qtyWheels,
        customerName: formData.customerName,
        wheelMaterial: formData.wheelMaterial,
        wheelType: formData.wheelType,
        handHoles: formData.handHoles,
        wheelSize: formData.wheelSize,
        wheelColor: formData.wheelColor,
        timestamp: new Date().toISOString(),
      };

      console.log("🔍 WHEEL FORM - Submitting raw schedule arrival:", submissionData.scheduleArrival);
      console.log("🔍 WHEEL FORM - Full submission data:", JSON.stringify(submissionData, null, 2));

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
      console.error("❌ WHEEL FORM - Error submitting wheel order:", error);
      toast({
        title: "Error",
        description: "There was a problem submitting your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    managerEmail,
    isSubmitting,
    user,
    handleInputChange,
    handleStoreChange,
    handleSubmit
  };
}
