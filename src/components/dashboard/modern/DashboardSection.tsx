import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface DashboardSectionProps {
  id?: string;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function DashboardSection({
  id,
  title,
  children,
  defaultOpen = true,
}: DashboardSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card id={id} className="overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="p-6">
          <CollapsibleTrigger className="flex items-center justify-between w-full hover:opacity-80 transition-opacity">
            <CardTitle className="text-2xl font-semibold">{title}</CardTitle>
            <ChevronDown
              className={cn(
                "h-5 w-5 transition-transform duration-200",
                isOpen ? "transform rotate-180" : ""
              )}
            />
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="p-6 pt-0">{children}</CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
