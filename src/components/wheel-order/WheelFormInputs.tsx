
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { stores } from "@/components/order-form/formConfig";
import { WheelFormData } from "./types";
import { User, Building, Mail, Calendar, Hash, CircleUser, Layers, Activity, CircleDot, Ruler, Palette } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
    <div className="space-y-8">
      {/* Contact Information Section */}
      <div>
        <div className="flex items-center space-x-2 mb-4 border-l-4 border-blue-500 pl-3">
          <User size={18} className="text-blue-500" />
          <h3 className="text-lg font-medium text-gray-800">Contact Information</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-5">
          <div className="space-y-2 group">
            <Label htmlFor="yourName" className="flex items-center text-gray-700 group-hover:text-blue-600 transition-colors">
              <User size={16} className="mr-1.5 text-gray-400 group-hover:text-blue-500" />
              Your Name
            </Label>
            <Input
              id="yourName"
              value={formData.yourName}
              onChange={(e) => onInputChange("yourName", e.target.value)}
              placeholder="Enter your name"
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-200 transition-all duration-200"
              required
            />
          </div>

          <div className="space-y-2 group">
            <Label htmlFor="store" className="flex items-center text-gray-700 group-hover:text-blue-600 transition-colors">
              <Building size={16} className="mr-1.5 text-gray-400 group-hover:text-blue-500" />
              Store Location
            </Label>
            <Select
              value={formData.storeId}
              onValueChange={(value) => onStoreChange(value)}
              disabled={!user?.isAdmin}
              required
            >
              <SelectTrigger 
                id="store" 
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-200 transition-all duration-200 bg-white"
              >
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

          <div className="space-y-2 group">
            <Label htmlFor="managerEmail" className="flex items-center text-gray-700 group-hover:text-blue-600 transition-colors">
              <Mail size={16} className="mr-1.5 text-gray-400 group-hover:text-blue-500" />
              Manager Email
            </Label>
            <Input
              id="managerEmail"
              value={managerEmail}
              disabled={true}
              className="bg-gray-50 border-gray-200 text-gray-500"
            />
          </div>

          <div className="space-y-2 group">
            <Label htmlFor="dateReceived" className="flex items-center text-gray-700 group-hover:text-blue-600 transition-colors">
              <Calendar size={16} className="mr-1.5 text-gray-400 group-hover:text-blue-500" />
              Date Received
            </Label>
            <Input
              id="dateReceived"
              type="date"
              value={formData.dateReceived}
              onChange={(e) => onInputChange("dateReceived", e.target.value)}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-200 transition-all duration-200"
              required
            />
          </div>
        </div>
      </div>

      {/* Order Details Section */}
      <div>
        <div className="flex items-center space-x-2 mb-4 border-l-4 border-green-500 pl-3">
          <Hash size={18} className="text-green-500" />
          <h3 className="text-lg font-medium text-gray-800">Order Details</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-5">
          <div className="space-y-2 group">
            <Label htmlFor="qtyWheels" className="flex items-center text-gray-700 group-hover:text-blue-600 transition-colors">
              <Hash size={16} className="mr-1.5 text-gray-400 group-hover:text-blue-500" />
              Quantity of Wheels
            </Label>
            <Input
              id="qtyWheels"
              type="number"
              value={formData.qtyWheels}
              onChange={(e) => onInputChange("qtyWheels", e.target.value)}
              placeholder="Enter quantity"
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-200 transition-all duration-200"
              required
            />
          </div>

          <div className="space-y-2 group">
            <Label htmlFor="customerName" className="flex items-center text-gray-700 group-hover:text-blue-600 transition-colors">
              <CircleUser size={16} className="mr-1.5 text-gray-400 group-hover:text-blue-500" />
              Customer Name
            </Label>
            <Input
              id="customerName"
              value={formData.customerName}
              onChange={(e) => onInputChange("customerName", e.target.value)}
              placeholder="Enter customer name"
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-200 transition-all duration-200"
              required
            />
          </div>
        </div>
      </div>

      {/* Wheel Specifications Section */}
      <div>
        <div className="flex items-center space-x-2 mb-4 border-l-4 border-orange-500 pl-3">
          <Layers size={18} className="text-orange-500" />
          <h3 className="text-lg font-medium text-gray-800">Wheel Specifications</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-5">
          <div className="space-y-2 group">
            <Label htmlFor="wheelMaterial" className="flex items-center text-gray-700 group-hover:text-blue-600 transition-colors">
              <Layers size={16} className="mr-1.5 text-gray-400 group-hover:text-blue-500" />
              Wheel Material
            </Label>
            <Select
              value={formData.wheelMaterial}
              onValueChange={(value) => onInputChange("wheelMaterial", value)}
              required
            >
              <SelectTrigger 
                id="wheelMaterial" 
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-200 transition-all duration-200 bg-white"
              >
                <SelectValue placeholder="Select material" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Steel">Steel</SelectItem>
                <SelectItem value="Aluminum">Aluminum</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 group">
            <Label htmlFor="wheelType" className="flex items-center text-gray-700 group-hover:text-blue-600 transition-colors">
              <Activity size={16} className="mr-1.5 text-gray-400 group-hover:text-blue-500" />
              Wheel Type
            </Label>
            <Select
              value={formData.wheelType}
              onValueChange={(value) => onInputChange("wheelType", value)}
              required
            >
              <SelectTrigger 
                id="wheelType" 
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-200 transition-all duration-200 bg-white"
              >
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pilot">Pilot</SelectItem>
                <SelectItem value="Hub">Hub</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 group">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label htmlFor="handHoles" className="flex items-center text-gray-700 group-hover:text-blue-600 transition-colors cursor-help">
                    <CircleDot size={16} className="mr-1.5 text-gray-400 group-hover:text-blue-500" />
                    Number of Hand Holes
                  </Label>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Number of circular holes around the wheel center</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Input
              id="handHoles"
              type="number"
              value={formData.handHoles}
              onChange={(e) => onInputChange("handHoles", e.target.value)}
              placeholder="Enter the number"
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-200 transition-all duration-200"
              required
            />
          </div>

          <div className="space-y-2 group">
            <Label htmlFor="wheelSize" className="flex items-center text-gray-700 group-hover:text-blue-600 transition-colors">
              <Ruler size={16} className="mr-1.5 text-gray-400 group-hover:text-blue-500" />
              Wheel Size
            </Label>
            <Select
              value={formData.wheelSize}
              onValueChange={(value) => onInputChange("wheelSize", value)}
              required
            >
              <SelectTrigger 
                id="wheelSize" 
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-200 transition-all duration-200 bg-white"
              >
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

          <div className="space-y-2 group">
            <Label htmlFor="wheelColor" className="flex items-center text-gray-700 group-hover:text-blue-600 transition-colors">
              <Palette size={16} className="mr-1.5 text-gray-400 group-hover:text-blue-500" />
              Desired Wheel Color
            </Label>
            <Select
              value={formData.wheelColor}
              onValueChange={(value) => onInputChange("wheelColor", value)}
              required
            >
              <SelectTrigger 
                id="wheelColor" 
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-200 transition-all duration-200 bg-white"
              >
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
      </div>
    </div>
  );
}
