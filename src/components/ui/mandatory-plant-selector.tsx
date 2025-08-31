
import React from 'react';
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import { NeoSelect, NeoSelectContent, NeoSelectItem, NeoSelectTrigger, NeoSelectValue } from "@/components/ui/NeoSelect";

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
    <div className="space-y-4">
      <div className="flex items-center space-x-3 p-4 bg-amber-950/30 border border-amber-500/30 rounded-lg">
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
        <div>
          <p className="text-sm text-amber-200">
            Required: Select the plant that this order be routed to. if unsure, contact your warehouse manager.
          </p>
        </div>
      </div>

      <NeoSelect value={value} onValueChange={onChange} disabled={disabled}>
        <NeoSelectTrigger>
          <NeoSelectValue placeholder="Select destination plant" />
        </NeoSelectTrigger>
        <NeoSelectContent>
          {PLANT_OPTIONS.map((plant) => (
            <NeoSelectItem key={plant.value} value={plant.value}>
              {plant.label}
            </NeoSelectItem>
          ))}
        </NeoSelectContent>
      </NeoSelect>
      
      {error && (
        <p className="text-sm text-red-400 font-medium">{error}</p>
      )}
    </div>
  );
}
