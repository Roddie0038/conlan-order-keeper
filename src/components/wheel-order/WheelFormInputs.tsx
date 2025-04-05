
import { WheelFormData } from "./types";
import { ContactInformation } from "./sections/ContactInformation";
import { OrderDetails } from "./sections/OrderDetails";
import { WheelSpecifications } from "./sections/WheelSpecifications";

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
  return (
    <div className="space-y-8">
      <ContactInformation 
        formData={formData}
        managerEmail={managerEmail}
        onInputChange={onInputChange}
        onStoreChange={onStoreChange}
        user={user}
      />
      
      <OrderDetails 
        formData={formData}
        onInputChange={onInputChange}
      />
      
      <WheelSpecifications 
        formData={formData}
        onInputChange={onInputChange}
      />
    </div>
  );
}
