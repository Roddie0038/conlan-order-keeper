import * as React from "react";
import { cn } from "@/lib/utils";

export interface NeoTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const NeoTextarea = React.forwardRef<HTMLTextAreaElement, NeoTextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "neopill min-h-[80px] text-slate-900 placeholder:text-slate-400", 
          props.disabled && "text-slate-500 opacity-100",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
NeoTextarea.displayName = "NeoTextarea";

export { NeoTextarea };