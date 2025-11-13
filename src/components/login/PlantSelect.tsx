
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { HelpCircle, Building } from "lucide-react";
import { useOTPlants } from "@/integrations/ot-platform/hooks/useOTPlants";

interface PlantSelectProps {
  selectedPlant: string;
  setSelectedPlant: (value: string) => void;
}

export const PlantSelect = ({ selectedPlant, setSelectedPlant }: PlantSelectProps) => {
  const { data: plants = [], isLoading } = useOTPlants();
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
          {isLoading ? (
            <SelectItem value="" disabled>Loading plants...</SelectItem>
          ) : plants.length > 0 ? (
            plants.map(plant => (
              <SelectItem key={plant.plant_code} value={plant.plant_name}>
                {plant.plant_name}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="" disabled>No plants available</SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
