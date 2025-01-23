import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { submitToGoogleSheets } from "@/services/sheets";

const stores = [
  { id: "22", name: "Fort Worth 22" },
  { id: "27", name: "Grand Prairie 27" },
  { id: "28", name: "Houston 28" },
  { id: "29", name: "San Antonio 29" },
  { id: "30", name: "OKC 30" },
  { id: "32", name: "Little Rock 32" },
  { id: "33", name: "Kansas 33" },
  { id: "35", name: "Laredo 35" },
  { id: "36", name: "Tulsa 36" },
  { id: "39", name: "Austin 39" },
];

const scheduleOptions = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Will Call Pick Up",
];

export const OrderForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    yourName: "",
    store: "",
    dateReceived: "",
    productNumber: "",
    description: "",
    quantity: "",
    scheduleArrival: "",
    notes: "",
    crossDock: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await submitToGoogleSheets({
        timestamp: new Date().toLocaleString(),
        ...formData,
      });
      
      toast({
        title: "Order Submitted",
        description: "Your order has been successfully recorded.",
      });
      
      // Reset form
      setFormData({
        yourName: "",
        store: "",
        dateReceived: "",
        productNumber: "",
        description: "",
        quantity: "",
        scheduleArrival: "",
        notes: "",
        crossDock: "",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Your Name</label>
          <Input
            required
            value={formData.yourName}
            onChange={(e) => handleChange("yourName", e.target.value)}
            className="w-full"
            placeholder="Enter your name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Store</label>
          <Select
            value={formData.store}
            onValueChange={(value) => handleChange("store", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select store" />
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

        <div>
          <label className="block text-sm font-medium mb-1">Date Received</label>
          <Input
            type="datetime-local"
            required
            value={formData.dateReceived}
            onChange={(e) => handleChange("dateReceived", e.target.value)}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Product Number</label>
          <Input
            required
            value={formData.productNumber}
            onChange={(e) => handleChange("productNumber", e.target.value)}
            className="w-full"
            placeholder="Enter product number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <Input
            required
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="w-full"
            placeholder="Enter product description"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Quantity</label>
          <Input
            type="number"
            required
            value={formData.quantity}
            onChange={(e) => handleChange("quantity", e.target.value)}
            className="w-full"
            placeholder="Enter quantity"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Schedule Arrival</label>
          <Select
            value={formData.scheduleArrival}
            onValueChange={(value) => handleChange("scheduleArrival", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select arrival day" />
            </SelectTrigger>
            <SelectContent>
              {scheduleOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <Input
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            className="w-full"
            placeholder="Enter any additional notes"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Cross Dock</label>
          <Select
            value={formData.crossDock}
            onValueChange={(value) => handleChange("crossDock", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select yes/no" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Submit Order"}
      </Button>
    </form>
  );
};