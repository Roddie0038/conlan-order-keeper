
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
    <div className="space-y-2 p-4 border-2 border-yellow-400 rounded-lg bg-yellow-50">
      <Label className="text-lg font-bold text-gray-900 flex items-center gap-2">
        ⚠️ 📍 Select Destination Plant *
      </Label>
      <Select value={value} onValueChange={onChange} disabled={disabled} required>
        <SelectTrigger className={`h-12 border-2 text-lg font-medium ${
          error ? 'border-red-500' : 'border-yellow-500'
        }`}>
          <SelectValue placeholder="-- Select Plant --" />
        </SelectTrigger>
        <SelectContent className="bg-white border-2 border-gray-300 z-50">
          {PLANT_OPTIONS.map((plant) => (
            <SelectItem key={plant.value} value={plant.value}>
              {plant.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-sm text-red-600 font-medium">{error}</p>
      )}
      <p className="text-sm text-gray-600 italic">
        Required: Select the plant that this order will be routed to. If unsure, contact your warehouse manager.
      </p>
    </div>
  );
}
