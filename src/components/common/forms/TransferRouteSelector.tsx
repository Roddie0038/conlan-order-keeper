import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { TRANSFER_ROUTES, type TransferRoute } from '@/types/orders';

interface TransferRouteSelectorProps {
  value?: TransferRoute;
  onChange: (value: TransferRoute) => void;
  label?: string;
  className?: string;
}

export function TransferRouteSelector({
  value,
  onChange,
  label = 'Transfer Route',
  className = '',
}: TransferRouteSelectorProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-sm font-medium">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select transfer route..." />
        </SelectTrigger>
        <SelectContent>
          {TRANSFER_ROUTES.map((route) => (
            <SelectItem key={route.value} value={route.value}>
              {route.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}