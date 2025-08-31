import * as React from "react";
import { cn } from "@/lib/utils";

export interface NeoTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const NeoTextarea = React.forwardRef<HTMLTextAreaElement, NeoTextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn("neopill min-h-[80px]", className)}
        ref={ref}
        {...props}
      />
    );
  }
);
NeoTextarea.displayName = "NeoTextarea";

export { NeoTextarea };