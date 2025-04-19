
import { FormData } from "../formConfig";
import { FormField } from "../FormField";
import { Calendar, MessageSquare } from "lucide-react";
import { scheduleOptions } from "../formConfig";

interface SchedulingNotesProps {
  formData: FormData;
  onChange: (field: keyof FormData, value: string) => void;
}

export const SchedulingNotes = ({ formData, onChange }: SchedulingNotesProps) => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4 border-l-4 border-orange-500 pl-3">
        <Calendar className="h-5 w-5 text-orange-400" />
        <h3 className="text-lg font-medium text-white">Schedule & Notes</h3>
      </div>

      <div className="pl-4 space-y-4">
        <FormField 
          label="Schedule Arrival" 
          required 
          value={formData.scheduleArrival} 
          onChange={value => onChange("scheduleArrival", value)} 
          options={scheduleOptions} 
          placeholder="Select arrival day" 
        />

        <FormField 
          label="Notes" 
          value={formData.notes} 
          onChange={value => onChange("notes", value)} 
          placeholder="Enter any additional notes" 
        />
      </div>
    </div>
  );
};
