
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { stores } from "@/components/order-form/formConfig";
import { WheelFormData } from "./types";

interface WheelFormInputsProps {
  formData: WheelFormData;
  managerEmail: string;
  onInputChange: (name: string, value: string) => void;
  onStoreChange: (value: string) => void;
  user: any;
}

export function WheelFormInputs({ 
  formData, 
  managerEmail, 
  onInputChange, 
  onStoreChange, 
  user 
}: WheelFormInputsProps) {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="yourName">Your Name</Label>
        <Input
          id="yourName"
          value={formData.yourName}
          onChange={(e) => onInputChange("yourName", e.target.value)}
          placeholder="Enter your name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="store">Store Location & Number</Label>
        <Select
          value={formData.storeId}
          onValueChange={(value) => onStoreChange(value)}
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
          onChange={(e) => onInputChange("dateReceived", e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="qtyWheels">Quantity of Wheels</Label>
        <Input
          id="qtyWheels"
          type="number"
          value={formData.qtyWheels}
          onChange={(e) => onInputChange("qtyWheels", e.target.value)}
          placeholder="Enter quantity"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="customerName">Customer Name</Label>
        <Input
          id="customerName"
          value={formData.customerName}
          onChange={(e) => onInputChange("customerName", e.target.value)}
          placeholder="Enter customer name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="wheelMaterial">Wheel Material</Label>
        <Select
          value={formData.wheelMaterial}
          onValueChange={(value) => onInputChange("wheelMaterial", value)}
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
          onValueChange={(value) => onInputChange("wheelType", value)}
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
          onChange={(e) => onInputChange("handHoles", e.target.value)}
          placeholder="Enter the number"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="wheelSize">Wheel Size</Label>
        <Select
          value={formData.wheelSize}
          onValueChange={(value) => onInputChange("wheelSize", value)}
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
          onValueChange={(value) => onInputChange("wheelColor", value)}
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
  );
}
