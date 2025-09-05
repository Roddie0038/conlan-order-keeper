import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Keep CVA for the whole app, but add a "neutral" variant with no color classes.
 * We'll use this when liveEditCompatible === true so Live Edit can control colors.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        neutral: "" // <— no color classes; allows CSS vars/inline styles to take over
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** When true, we avoid color variants so Live Edit can override via CSS vars. */
  liveEditCompatible?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      liveEditCompatible = false,
      style,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const classes = cn(
      buttonVariants({
        variant: liveEditCompatible ? "neutral" : (variant ?? "default"),
        size,
      }),
      className
    );

    return <Comp ref={ref} className={classes} style={style} {...props} />;
  }
);

Button.displayName = "Button";
export { Button, buttonVariants };
