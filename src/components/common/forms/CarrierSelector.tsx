import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { CARRIER_OPTIONS, type Carrier } from '@/types/orders';

interface CarrierSelectorProps {
  value?: Carrier;
  onChange: (value: Carrier) => void;
  label?: string;
  className?: string;
}

export function CarrierSelector({
  value,
  onChange,
  label = 'Carrier',
  className = '',
}: CarrierSelectorProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-sm font-medium">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select carrier..." />
        </SelectTrigger>
        <SelectContent>
          {CARRIER_OPTIONS.map((carrier) => (
            <SelectItem key={carrier.value} value={carrier.value}>
              {carrier.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}