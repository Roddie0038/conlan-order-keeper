import { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface RequestButtonProps {
  icon: LucideIcon;
  title: string;
  path: string;
  variant?: "default" | "warning";
}

export function RequestButton({
  icon: Icon,
  title,
  path,
  variant = "default",
}: RequestButtonProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(path)}
      className={cn(
        "w-full flex items-center justify-between p-4 rounded-lg border transition-all hover:border-primary hover:bg-accent/50 group",
        variant === "warning" && "border-destructive/20 hover:border-destructive"
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "p-2 rounded-lg",
            variant === "default" ? "bg-primary/10" : "bg-destructive/10"
          )}
        >
          <Icon
            className={cn(
              "h-5 w-5",
              variant === "default" ? "text-primary" : "text-destructive"
            )}
          />
        </div>
        <span className="font-medium">{title}</span>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
    </button>
  );
}
