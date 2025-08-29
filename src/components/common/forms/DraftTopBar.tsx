import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, AlertCircle, Save } from "lucide-react";

export interface DraftTopBarProps {
  saveStatus: "idle" | "saving" | "saved" | "error";
  lastSaved: Date | null;
  onSaveNow: () => void;
  onDiscard: () => void;
}

export function DraftTopBar({
  saveStatus,
  lastSaved,
  onSaveNow,
  onDiscard,
}: DraftTopBarProps) {
  const getStatusConfig = () => {
    switch (saveStatus) {
      case "saving":
        return {
          icon: <Loader2 className="h-3 w-3 animate-spin" />,
          label: "Saving…",
          variant: "secondary" as const,
        };
      case "saved":
        return {
          icon: <Check className="h-3 w-3" />,
          label: lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : "All changes saved",
          variant: "secondary" as const,
        };
      case "error":
        return {
          icon: <AlertCircle className="h-3 w-3" />,
          label: "Save failed",
          variant: "destructive" as const,
        };
      default:
        return {
          icon: <Save className="h-3 w-3" />,
          label: "Ready",
          variant: "outline" as const,
        };
    }
  };

  const statusConfig = getStatusConfig();

  // Ctrl/Cmd+S to save now
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const metaOrCtrl = e.ctrlKey || e.metaKey;
      if (metaOrCtrl && e.key.toLowerCase() === "s") {
        e.preventDefault();
        onSaveNow();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSaveNow]);

  return (
    <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Badge variant={statusConfig.variant} className="gap-1.5">
            {statusConfig.icon}
            <span className="text-xs font-medium">{statusConfig.label}</span>
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onDiscard}
            className="text-muted-foreground hover:text-foreground"
          >
            Discard
          </Button>
          <Button 
            size="sm"
            onClick={onSaveNow}
            className="gap-1.5"
            disabled={saveStatus === "saving"}
          >
            <Save className="h-3 w-3" />
            Save Draft
          </Button>
        </div>
      </div>
      
      <div className="px-4 pb-3">
        <div className="rounded-md bg-primary/5 border border-primary/20 px-3 py-2">
          <p className="text-xs text-muted-foreground leading-relaxed">
            This saves your <span className="font-medium text-foreground">draft</span> only. 
            It will <span className="font-medium text-foreground">not</span> submit the order 
            or generate documents. You can safely leave and come back.
          </p>
        </div>
      </div>
    </div>
  );
}