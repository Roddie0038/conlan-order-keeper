import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    return <div>
        <label className="block text-sm font-medium mb-1">{label}</label>
        <Select value={value} onValueChange={value => onChange(value)} disabled={disabled}>
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map(option => <SelectItem key={option.id || option.value} value={option.id || option.value || ""}>
                {option.name || option.value}
              </SelectItem>)}
          </SelectContent>
        </Select>
      </div>;
  }
  return <div>
      <label className="block text-sm font-medium mb-1 mx-0 px-[160px] bg-amber-500">{label}</label>
      <Input type={type} required={required} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled} className="w-full bg-zinc-50 rounded-lg" />
    </div>;
};