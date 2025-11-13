
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
          <SelectTrigger className="w-full border border-gray-600 rounded-md h-10 bg-black/40 hover:border-blue-400 focus:border-blue-500 transition-colors shadow-sm backdrop-blur-sm text-white disabled:opacity-100 disabled:text-gray-200 disabled:bg-gray-700/60">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="bg-gray-900/95 border border-gray-800 shadow-md rounded-md backdrop-blur-sm">
            {options.map(option => (
              <SelectItem 
                key={option.id || option.value} 
                value={option.id || option.value || ""}
                className="hover:bg-gray-800 cursor-pointer text-gray-200"
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
        className="w-full border border-gray-600 rounded-md h-10 bg-black/40 disabled:bg-gray-700/40 
                 hover:border-blue-400 focus-visible:border-blue-500 focus-visible:ring-blue-400
                 transition-all duration-200 shadow-sm backdrop-blur-sm text-white"
      />
    </div>
  );
};
