
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface AdminTestModeToggleProps {
  testMode: boolean;
  onToggleTestMode: (checked: boolean) => void;
}

export function AdminTestModeToggle({ 
  testMode, 
  onToggleTestMode 
}: AdminTestModeToggleProps) {
  return (
    <div className="flex items-center">
      <Checkbox
        id="testMode"
        checked={testMode}
        onCheckedChange={(checked) => onToggleTestMode(checked as boolean)}
        className="mr-2"
      />
      <Label htmlFor="testMode" className="text-sm">
        Enable notifications (live mode)
      </Label>
    </div>
  );
}
