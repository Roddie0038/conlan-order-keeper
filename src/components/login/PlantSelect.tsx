
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { HelpCircle, Building } from "lucide-react";

interface PlantSelectProps {
  selectedPlant: string;
  setSelectedPlant: (value: string) => void;
}

const plants = [
  { value: "Grand Prairie 97", label: "Grand Prairie 97" },
  { value: "Romulus 98", label: "Romulus 98" },
  { value: "Mulberry 99", label: "Mulberry 99" }
];

export const PlantSelect = ({ selectedPlant, setSelectedPlant }: PlantSelectProps) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-sm font-medium text-gray-200">
          Select Plant
        </label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-auto p-0">
                <HelpCircle className="h-4 w-4 text-gray-300" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-slate-800 text-white">
              <p>Select the plant you're working with</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Select value={selectedPlant} onValueChange={value => setSelectedPlant(value)}>
        <SelectTrigger className="w-full bg-white/10 border-white/20 text-white focus:ring-offset-blue-500">
          <div className="flex items-center gap-2">
            <Building size={16} />
            <SelectValue placeholder="Select plant" />
          </div>
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {plants.map(plant => (
            <SelectItem key={plant.value} value={plant.value}>
              {plant.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
