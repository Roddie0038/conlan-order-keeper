import * as React from "react";
import { cn } from "@/lib/utils";

interface NeoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger";
  size?: "md" | "lg";
}

const NeoButton = React.forwardRef<HTMLButtonElement, NeoButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const sizes = {
      md: "px-4 py-2 text-sm",
      lg: "px-5 py-3 text-sm",
    }[size];

    const variants = {
      primary:
        "bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white ring-1 ring-white/15 hover:brightness-110",
      ghost:
        "bg-white/5 text-neutral-100 ring-1 ring-white/10 hover:bg-white/10",
      danger:
        "bg-white/5 text-red-300 ring-1 ring-red-400/30 hover:bg-white/10",
    }[variant];

    return (
      <button
        ref={ref}
        className={cn(
          "rounded-xl shadow-[0_8px_24px_-12px_rgba(0,0,0,0.6)] transition-all",
          sizes,
          variants,
          className
        )}
        {...props}
      />
    );
  }
);
NeoButton.displayName = "NeoButton";

export { NeoButton };