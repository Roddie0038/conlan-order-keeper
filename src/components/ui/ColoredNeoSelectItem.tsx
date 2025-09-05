import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ColoredNeoSelectItemProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> {
  colorClass?: string;
}

const ColoredNeoSelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  ColoredNeoSelectItemProps
>(({ className, children, colorClass, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-white/10 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      colorClass || "text-white",
      "focus:text-white",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4 text-white" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
ColoredNeoSelectItem.displayName = "ColoredNeoSelectItem";

export { ColoredNeoSelectItem };