import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ArrivalDateSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

export function ArrivalDateSelector({
  value,
  onChange,
  label = 'Requested Arrival Date',
  className = '',
}: ArrivalDateSelectorProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-sm font-medium">{label}</Label>
      <Input
        type="date"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full"
      />
    </div>
  );
}