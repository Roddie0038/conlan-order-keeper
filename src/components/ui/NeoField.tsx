import * as React from "react";
import { cn } from "@/lib/utils";

export interface NeoFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const NeoField = React.forwardRef<HTMLInputElement, NeoFieldProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        className={cn(
          "neopill text-slate-900 placeholder:text-slate-400", 
          props.disabled && "text-slate-500 opacity-100",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
NeoField.displayName = "NeoField";

export { NeoField };