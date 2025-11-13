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
        "w-full flex items-center justify-between p-4 rounded-lg border backdrop-blur-sm transition-all group",
        "bg-slate-800/40 border-white/10 hover:bg-slate-800/60 hover:border-white/20 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5",
        variant === "warning" && "border-red-500/20 hover:border-red-500/40 hover:bg-red-900/20"
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "p-2 rounded-lg shadow-lg",
            variant === "default" 
              ? "bg-gradient-to-br from-blue-600 to-blue-700 shadow-blue-600/30" 
              : "bg-gradient-to-br from-red-600 to-red-700 shadow-red-600/30"
          )}
        >
          <Icon
            className={cn(
              "h-5 w-5",
              "text-white"
            )}
          />
        </div>
        <span className="font-medium text-white">{title}</span>
      </div>
      <ChevronRight className={cn(
        "h-4 w-4 transition-all",
        variant === "default" 
          ? "text-slate-400 group-hover:text-blue-400 group-hover:translate-x-1" 
          : "text-slate-400 group-hover:text-red-400 group-hover:translate-x-1"
      )} />
    </button>
  );
}
