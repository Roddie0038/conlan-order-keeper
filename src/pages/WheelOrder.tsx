
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { submitToGoogleSheets } from "@/services/sheets";
import { Navigation } from "@/components/Navigation";
import { stores, getManagerEmail } from "@/components/order-form/formConfig";
import { Disc } from "lucide-react";

export default function WheelOrder() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [managerEmail, setManagerEmail] = useState("");
  
  const [formData, setFormData] = useState({
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

  // Define wheel size and color options
  const wheelSizeOptions = [
    { value: "8.25x22.5", label: "8.25x22.5" },
    { value: "24.5x8.25", label: "24.5x8.25" }
  ];

  const wheelColorOptions = [
    { value: "WHITE", label: "WHITE" },
    { value: "BLACK", label: "BLACK" },
    { value: "GRAY", label: "GRAY" }
  ];

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
    <div className="min-h-screen bg-[#E2E8E4] pb-8">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
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
            <CardContent className="grid gap-4 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="yourName">Your Name</Label>
                  <Input
                    id="yourName"
                    value={formData.yourName}
                    onChange={(e) => handleInputChange("yourName", e.target.value)}
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="store">Store Location & Number</Label>
                  <Select
                    value={formData.storeId}
                    onValueChange={(value) => handleStoreChange(value)}
                    disabled={!user?.isAdmin}
                    required
                  >
                    <SelectTrigger id="store" className="w-full">
                      <SelectValue placeholder={formData.storeName || "Select store"} />
                    </SelectTrigger>
                    <SelectContent>
                      {stores.map((store) => (
                        <SelectItem key={store.id} value={store.id}>
                          {store.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="managerEmail">Manager Email</Label>
                  <Input
                    id="managerEmail"
                    value={managerEmail}
                    disabled={true}
                    className="bg-gray-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateReceived">Date Received</Label>
                  <Input
                    id="dateReceived"
                    type="date"
                    value={formData.dateReceived}
                    onChange={(e) => handleInputChange("dateReceived", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qtyWheels">Quantity of Wheels</Label>
                  <Input
                    id="qtyWheels"
                    type="number"
                    value={formData.qtyWheels}
                    onChange={(e) => handleInputChange("qtyWheels", e.target.value)}
                    placeholder="Enter quantity"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => handleInputChange("customerName", e.target.value)}
                    placeholder="Enter customer name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wheelMaterial">Wheel Material</Label>
                  <Select
                    value={formData.wheelMaterial}
                    onValueChange={(value) => handleInputChange("wheelMaterial", value)}
                    required
                  >
                    <SelectTrigger id="wheelMaterial" className="w-full">
                      <SelectValue placeholder="Select material" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Steel">Steel</SelectItem>
                      <SelectItem value="Aluminum">Aluminum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wheelType">Wheel Type</Label>
                  <Select
                    value={formData.wheelType}
                    onValueChange={(value) => handleInputChange("wheelType", value)}
                    required
                  >
                    <SelectTrigger id="wheelType" className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pilot">Pilot</SelectItem>
                      <SelectItem value="Hub">Hub</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="handHoles">Number of Hand Holes</Label>
                  <Input
                    id="handHoles"
                    type="number"
                    value={formData.handHoles}
                    onChange={(e) => handleInputChange("handHoles", e.target.value)}
                    placeholder="Enter the number"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wheelSize">Wheel Size</Label>
                  <Select
                    value={formData.wheelSize}
                    onValueChange={(value) => handleInputChange("wheelSize", value)}
                    required
                  >
                    <SelectTrigger id="wheelSize" className="w-full">
                      <SelectValue placeholder="Select wheel size" />
                    </SelectTrigger>
                    <SelectContent>
                      {wheelSizeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wheelColor">Desired Wheel Color</Label>
                  <Select
                    value={formData.wheelColor}
                    onValueChange={(value) => handleInputChange("wheelColor", value)}
                    required
                  >
                    <SelectTrigger id="wheelColor" className="w-full">
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent>
                      {wheelColorOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
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
      </div>
    </div>
  );
}
