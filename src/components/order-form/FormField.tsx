
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
      <div className="space-y-2 group">
        <Label className="block text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        <Select 
          value={value} 
          onValueChange={value => onChange(value)} 
          disabled={disabled}
        >
          <SelectTrigger className="w-full border border-gray-300 rounded-md h-10 bg-white hover:border-blue-400 focus:border-blue-500 transition-colors shadow-sm">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-md rounded-md">
            {options.map(option => (
              <SelectItem 
                key={option.id || option.value} 
                value={option.id || option.value || ""}
                className="hover:bg-blue-50 cursor-pointer"
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
    <div className="space-y-2 group">
      <Label className="block text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Input 
        type={type} 
        required={required} 
        value={value} 
        onChange={e => onChange(e.target.value)} 
        placeholder={placeholder} 
        disabled={disabled} 
        className="w-full border border-gray-300 rounded-md h-10 bg-white disabled:bg-gray-100 
                 hover:border-blue-400 focus-visible:border-blue-500 focus-visible:ring-blue-400
                 transition-all duration-200 shadow-sm"
      />
    </div>
  );
};
