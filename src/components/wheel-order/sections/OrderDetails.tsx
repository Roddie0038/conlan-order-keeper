
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Hash, CircleUser } from "lucide-react";
import { WheelFormData } from "../types";

interface OrderDetailsProps {
  formData: WheelFormData;
  onInputChange: (name: string, value: string) => void;
}

export function OrderDetails({ formData, onInputChange }: OrderDetailsProps) {
  return (
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
  );
}
