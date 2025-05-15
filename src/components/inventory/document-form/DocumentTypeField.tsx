
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Control } from "react-hook-form";
import { DocumentFormValues } from "./schema";

interface DocumentTypeFieldProps {
  control: Control<DocumentFormValues>;
}

export function DocumentTypeField({ control }: DocumentTypeFieldProps) {
  return (
    <FormField
      control={control}
      name="type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Document Type</FormLabel>
          <Select 
            onValueChange={field.onChange} 
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="inventory-update">Inventory Sheet</SelectItem>
              <SelectItem value="invoice">Invoice</SelectItem>
              <SelectItem value="purchase_order">Purchase Order</SelectItem>
              <SelectItem value="packing_slip">Packing Slip</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
