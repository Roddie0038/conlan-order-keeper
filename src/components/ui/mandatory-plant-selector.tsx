
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const PLANT_OPTIONS = [
  { value: "Grand Prairie 097", label: "Grand Prairie 097" },
  { value: "Romulus 098", label: "Romulus 098" },
  { value: "Mulberry 099", label: "Mulberry 099" }
] as const;

export type PlantOption = typeof PLANT_OPTIONS[number]['value'];

interface MandatoryPlantSelectorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export function MandatoryPlantSelector({ 
  value, 
  onChange, 
  error, 
  disabled = false 
}: MandatoryPlantSelectorProps) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-neutral-200">
        Destination Plant *
      </Label>
      <Select value={value} onValueChange={onChange} disabled={disabled} required>
        <SelectTrigger className="neopill">
          <SelectValue placeholder="Select destination plant" />
        </SelectTrigger>
        <SelectContent className="bg-neutral-900 border border-white/10 z-50">
          {PLANT_OPTIONS.map((plant) => (
            <SelectItem key={plant.value} value={plant.value} className="text-white hover:bg-white/10">
              {plant.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-sm text-red-400 font-medium">{error}</p>
      )}
      <p className="text-xs text-neutral-400">
        Auto-mapped from your store selection. Plant assignment is determined by store-to-plant routing rules.
      </p>
    </div>
  );
}
