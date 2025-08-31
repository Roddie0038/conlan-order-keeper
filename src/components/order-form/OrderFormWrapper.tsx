
import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Building } from "lucide-react";

interface OrderFormWrapperProps {
  children: ReactNode;
  destinationPlant?: string;
}

export function OrderFormWrapper({ children, destinationPlant }: OrderFormWrapperProps) {
  
  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {destinationPlant && (
        <div className="flex justify-center mb-6">
          <Badge 
            variant="outline" 
            className="py-2 px-4 bg-gradient-to-r from-blue-700 to-blue-900 border-2 border-amber-400 text-white flex items-center gap-2 text-base shadow-md"
          >
            <Building className="h-5 w-5 text-amber-400" />
            <span className="font-bold">Selected Plant: <span className="text-amber-400">{destinationPlant}</span></span>
          </Badge>
        </div>
      )}
      
      {/* Dark container scoped to form only */}
      <div className="bg-neutral-950 text-neutral-100 rounded-2xl shadow-xl border border-gray-200 overflow-hidden transition-all hover:shadow-2xl">
        <div className="p-6 sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
