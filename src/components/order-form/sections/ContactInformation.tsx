
import { FormData, getManagerEmail } from "../formConfig";
import { FormField } from "../FormField";
import { Info, User, Building, Mail, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

interface ContactInformationProps {
  formData: FormData;
  onChange: (field: keyof FormData, value: string) => void;
}

export const ContactInformation = ({ formData, onChange }: ContactInformationProps) => {
  const { user } = useAuth();

  useEffect(() => {
    if (user?.username) {
      onChange("yourName", user.username);
    }
  }, [user, onChange]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 border-l-4 border-blue-500 pl-3">
        <Info className="h-5 w-5 text-blue-400" />
        <h3 className="text-lg font-medium text-white">Contact Information</h3>
      </div>

      <div className="pl-4 space-y-4">
        <FormField 
          label="Your Name" 
          required 
          value={formData.yourName} 
          onChange={value => onChange("yourName", value)} 
          placeholder="Enter your name" 
        />

        <FormField 
          label="Store" 
          required 
          value={formData.store} 
          onChange={value => onChange("store", value)} 
          placeholder="Enter store number" 
        />

        <FormField 
          label="Date Received" 
          type="date" 
          required 
          value={formData.dateReceived} 
          onChange={value => onChange("dateReceived", value)} 
        />
      </div>
    </div>
  );
};
