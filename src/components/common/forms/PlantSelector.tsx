/**
 * Phase 4: Plant Selector Component
 * Reusable plant selection component for all order forms
 */

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormFieldWrapper } from './FormFieldWrapper';

export interface PlantSelectorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  label?: string;
  placeholder?: string;
  className?: string;
}

const PLANTS = [
  { value: 'Abilene', label: 'Abilene' },
  { value: 'Bakersfield', label: 'Bakersfield' },
  { value: 'Dallas', label: 'Dallas' },
  { value: 'Galveston', label: 'Galveston' },
  { value: 'Gladewater', label: 'Gladewater' },
  { value: 'Longview', label: 'Longview' },
  { value: 'Los Angeles', label: 'Los Angeles' },
  { value: 'Lubbock', label: 'Lubbock' },
  { value: 'Ontario', label: 'Ontario' },
  { value: 'San Antonio', label: 'San Antonio' },
  { value: 'Tucson', label: 'Tucson' },
  { value: 'Tyler', label: 'Tyler' },
  { value: 'Yuma', label: 'Yuma' },
];

export function PlantSelector({
  value,
  onChange,
  error,
  required = true,
  label = 'Destination Plant',
  placeholder = 'Select destination plant',
  className = '',
}: PlantSelectorProps) {
  return (
    <FormFieldWrapper
      label={label}
      required={required}
      error={error}
      className={className}
    >
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {PLANTS.map((plant) => (
            <SelectItem key={plant.value} value={plant.value}>
              {plant.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormFieldWrapper>
  );
}