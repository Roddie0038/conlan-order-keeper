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
    <Card 
      id={id} 
      className="overflow-hidden bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-xl shadow-black/50 hover:shadow-2xl hover:border-white/20 transition-all duration-300"
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="p-6">
          <CollapsibleTrigger className="flex items-center justify-between w-full hover:opacity-80 transition-opacity group">
            <CardTitle className="text-2xl font-semibold text-white">{title}</CardTitle>
            <ChevronDown
              className={cn(
                "h-5 w-5 text-slate-400 group-hover:text-white transition-all duration-200",
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
