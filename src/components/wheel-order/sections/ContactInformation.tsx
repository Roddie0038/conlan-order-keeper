
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { stores } from "@/components/order-form/formConfig";
import { User, Building, Mail, Calendar } from "lucide-react";
import { WheelFormData } from "../types";

interface ContactInformationProps {
  formData: WheelFormData;
  managerEmail: string;
  onInputChange: (name: string, value: string) => void;
  onStoreChange: (value: string) => void;
  user: any;
}

export function ContactInformation({
  formData,
  managerEmail,
  onInputChange,
  onStoreChange,
  user
}: ContactInformationProps) {
  return (
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
  );
}
