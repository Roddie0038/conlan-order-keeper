
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface FormFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  options?: Array<{
    id?: string;
    name?: string;
    value?: string;
  }>;
  disabled?: boolean;
}

export const FormField = ({
  label,
  type = "text",
  value,
  onChange,
  required = false,
  placeholder,
  options,
  disabled = false
}: FormFieldProps) => {
  if (options) {
    return (
      <div className="space-y-2 group transition-all duration-200">
        <Label className="block text-sm font-medium text-black group-hover:text-gray-900 transition-colors flex items-center gap-2">
          {label} {required && <span className="text-red-400">*</span>}
        </Label>
        <Select 
          value={value} 
          onValueChange={value => onChange(value)} 
          disabled={disabled}
        >
          <SelectTrigger className="w-full border border-gray-600 rounded-md h-10 bg-white hover:border-blue-400 focus:border-blue-500 transition-colors shadow-sm text-gray-900 disabled:opacity-100 disabled:text-gray-600 disabled:bg-gray-100">
            <SelectValue placeholder={placeholder} className="text-gray-900" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-300 shadow-lg rounded-md z-50">
            {options.map(option => (
              <SelectItem 
                key={option.id || option.value} 
                value={option.id || option.value || "none"}
                className="hover:bg-blue-50 cursor-pointer text-gray-900 focus:bg-blue-100"
              >
                {option.name || option.value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }
  
  return (
    <div className="space-y-2 group transition-all duration-200">
      <Label className="block text-sm font-medium text-black group-hover:text-gray-900 transition-colors flex items-center gap-2">
        {label} {required && <span className="text-red-400">*</span>}
      </Label>
      <Input 
        type={type} 
        required={required} 
        value={value} 
        onChange={e => onChange(e.target.value)} 
        placeholder={placeholder} 
        disabled={disabled} 
        className="w-full border border-gray-300 rounded-md h-10 bg-white disabled:bg-gray-100 disabled:text-gray-600
                 hover:border-blue-400 focus-visible:border-blue-500 focus-visible:ring-blue-400
                 transition-all duration-200 shadow-sm text-gray-900 placeholder:text-gray-400"
      />
    </div>
  );
};
