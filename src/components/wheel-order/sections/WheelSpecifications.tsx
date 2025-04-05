
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Layers, Activity, CircleDot, Ruler, Palette } from "lucide-react";
import { WheelFormData } from "../types";
import { 
  wheelSizeOptions, 
  wheelColorOptions,
  wheelMaterialOptions,
  wheelTypeOptions
} from "../constants/wheelOptions";

interface WheelSpecificationsProps {
  formData: WheelFormData;
  onInputChange: (name: string, value: string) => void;
}

export function WheelSpecifications({ formData, onInputChange }: WheelSpecificationsProps) {
  return (
    <div>
      <div className="flex items-center space-x-2 mb-4 border-l-4 border-orange-500 pl-3">
        <Layers size={18} className="text-orange-500" />
        <h3 className="text-lg font-medium text-gray-800">Wheel Specifications</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-5">
        <div className="space-y-2 group">
          <Label htmlFor="wheelMaterial" className="flex items-center text-gray-700 group-hover:text-blue-600 transition-colors">
            <Layers size={16} className="mr-1.5 text-gray-400 group-hover:text-blue-500" />
            Wheel Material
          </Label>
          <Select
            value={formData.wheelMaterial}
            onValueChange={(value) => onInputChange("wheelMaterial", value)}
            required
          >
            <SelectTrigger 
              id="wheelMaterial" 
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-200 transition-all duration-200 bg-white"
            >
              <SelectValue placeholder="Select material" />
            </SelectTrigger>
            <SelectContent>
              {wheelMaterialOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 group">
          <Label htmlFor="wheelType" className="flex items-center text-gray-700 group-hover:text-blue-600 transition-colors">
            <Activity size={16} className="mr-1.5 text-gray-400 group-hover:text-blue-500" />
            Wheel Type
          </Label>
          <Select
            value={formData.wheelType}
            onValueChange={(value) => onInputChange("wheelType", value)}
            required
          >
            <SelectTrigger 
              id="wheelType" 
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-200 transition-all duration-200 bg-white"
            >
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {wheelTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 group">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Label htmlFor="handHoles" className="flex items-center text-gray-700 group-hover:text-blue-600 transition-colors cursor-help">
                  <CircleDot size={16} className="mr-1.5 text-gray-400 group-hover:text-blue-500" />
                  Number of Hand Holes
                </Label>
              </TooltipTrigger>
              <TooltipContent>
                <p>Number of circular holes around the wheel center</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Input
            id="handHoles"
            type="number"
            value={formData.handHoles}
            onChange={(e) => onInputChange("handHoles", e.target.value)}
            placeholder="Enter the number"
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-200 transition-all duration-200"
            required
          />
        </div>

        <div className="space-y-2 group">
          <Label htmlFor="wheelSize" className="flex items-center text-gray-700 group-hover:text-blue-600 transition-colors">
            <Ruler size={16} className="mr-1.5 text-gray-400 group-hover:text-blue-500" />
            Wheel Size
          </Label>
          <Select
            value={formData.wheelSize}
            onValueChange={(value) => onInputChange("wheelSize", value)}
            required
          >
            <SelectTrigger 
              id="wheelSize" 
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-200 transition-all duration-200 bg-white"
            >
              <SelectValue placeholder="Select wheel size" />
            </SelectTrigger>
            <SelectContent>
              {wheelSizeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 group">
          <Label htmlFor="wheelColor" className="flex items-center text-gray-700 group-hover:text-blue-600 transition-colors">
            <Palette size={16} className="mr-1.5 text-gray-400 group-hover:text-blue-500" />
            Desired Wheel Color
          </Label>
          <Select
            value={formData.wheelColor}
            onValueChange={(value) => onInputChange("wheelColor", value)}
            required
          >
            <SelectTrigger 
              id="wheelColor" 
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-200 transition-all duration-200 bg-white"
            >
              <SelectValue placeholder="Select color" />
            </SelectTrigger>
            <SelectContent>
              {wheelColorOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
