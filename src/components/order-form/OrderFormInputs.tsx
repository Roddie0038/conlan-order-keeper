
import { FormData } from "./types";
import { FormField } from "./FormField";
import { ContactInformation } from "./sections/ContactInformation";
import { ProductDetails } from "./sections/ProductDetails";
import { SchedulingNotes } from "./sections/SchedulingNotes";
import { CrossDockOptions } from "./sections/CrossDockOptions";

interface OrderFormInputsProps {
  formData: FormData;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (field: keyof FormData, value: string) => void;
}

export const OrderFormInputs = ({
  formData,
  onSubmit,
  onChange
}: OrderFormInputsProps) => {
  return (
    <form onSubmit={onSubmit} className="max-w-2xl mx-auto backdrop-blur-md bg-black/60 p-8 rounded-xl shadow-xl border border-gray-800 transition-all">
      <div className="space-y-6">
        <ContactInformation 
          formData={formData} 
          onChange={onChange} 
        />
        
        <ProductDetails 
          formData={formData} 
          onChange={onChange} 
        />
        
        <SchedulingNotes 
          formData={formData} 
          onChange={onChange} 
        />
        
        <CrossDockOptions 
          formData={formData} 
          onChange={onChange} 
        />
      </div>

      <button 
        type="submit" 
        className="w-full text-slate-50 rounded-3xl bg-rose-600 hover:bg-rose-500 mt-8 transition-all hover:scale-[1.01] py-6 text-lg font-semibold shadow-lg"
      >
        ADD TO ORDER
      </button>
    </form>
  );
};
