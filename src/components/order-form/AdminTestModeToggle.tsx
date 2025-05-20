
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface AdminTestModeToggleProps {
  testMode: boolean;
  onToggleTestMode: (checked: boolean) => void;
}

// This component is now hidden but maintains compatibility with existing code
export function AdminTestModeToggle({ 
  testMode, 
  onToggleTestMode 
}: AdminTestModeToggleProps) {
  // Component is now empty (hidden) but still accepts the same props
  return null;
}
