
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
    if (user && user.store && !user.isAdmin) {
      onChange("store", user.store);
      const managerEmail = getManagerEmail(user.store);
      if (managerEmail) {
        onChange("managersEmail", managerEmail);
      }
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
          onChange={value => {
            onChange("store", value);
            const managerEmail = getManagerEmail(value);
            onChange("managersEmail", managerEmail);
          }} 
          options={[]} 
          disabled={!user?.isAdmin}
        />

        <FormField 
          label="Manager's Email" 
          type="email" 
          value={formData.managersEmail || ''} 
          onChange={() => {}} 
          disabled={true} 
          placeholder="Manager's email will be automatically set" 
        />

        <FormField 
          label="Date Received" 
          type="datetime-local" 
          required 
          value={formData.dateReceived} 
          onChange={value => onChange("dateReceived", value)} 
          disabled={true} 
        />
      </div>
    </div>
  );
};
