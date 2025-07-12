import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, Clock } from "lucide-react";

interface ClearFormButtonProps {
  onClear: () => void;
  lastSaved?: Date | null;
  disabled?: boolean;
  className?: string;
}

export function ClearFormButton({ onClear, lastSaved, disabled, className }: ClearFormButtonProps) {
  const [open, setOpen] = useState(false);

  const handleClear = () => {
    onClear();
    setOpen(false);
  };

  return (
    <div className="flex flex-col items-start space-y-2">
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={disabled}
            className={`text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground ${className}`}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Form
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Form Data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove all form data and any auto-saved progress. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClear} className="bg-destructive hover:bg-destructive/90">
              Clear All Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {lastSaved && (
        <div className="flex items-center text-xs text-muted-foreground">
          <Clock className="h-3 w-3 mr-1" />
          Last saved: {lastSaved.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}