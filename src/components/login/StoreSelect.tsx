
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";

interface StoreSelectProps {
  username: string;
  setUsername: (value: string) => void;
  stores: string[];
}

export const StoreSelect = ({ username, setUsername, stores }: StoreSelectProps) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-sm font-medium text-gray-200">
          Select Store
        </label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-auto p-0">
                <HelpCircle className="h-4 w-4 text-gray-300" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-slate-800 text-white">
              <p>Select your store from the dropdown</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Select value={username} onValueChange={value => setUsername(value)}>
        <SelectTrigger className="w-full bg-white/10 border-white/20 text-white focus:ring-offset-blue-500">
          <SelectValue placeholder="Select your store" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {stores.map(name => (
            <SelectItem key={name} value={name}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
