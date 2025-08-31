import * as React from "react";
import { cn } from "@/lib/utils";

export interface NeoFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const NeoField = React.forwardRef<HTMLInputElement, NeoFieldProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        className={cn("neopill", className)}
        ref={ref}
        {...props}
      />
    );
  }
);
NeoField.displayName = "NeoField";

export { NeoField };