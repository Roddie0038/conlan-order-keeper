
import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";
import { usePlant } from "@/contexts/PlantContext";
import { Badge } from "@/components/ui/badge";
import { Building } from "lucide-react";

interface OrderFormWrapperProps {
  children: ReactNode;
}

export function OrderFormWrapper({ children }: OrderFormWrapperProps) {
  const { selectedPlant } = usePlant();
  
  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-center mb-6">
        <Badge 
          variant="outline" 
          className="py-2 px-4 bg-gradient-to-r from-blue-700 to-blue-900 border-2 border-amber-400 text-white flex items-center gap-2 text-base shadow-md"
        >
          <Building className="h-5 w-5 text-amber-400" />
          <span className="font-bold">Plant: <span className="text-amber-400">{selectedPlant}</span></span>
        </Badge>
      </div>
      
      <Card className="shadow-xl border border-gray-200 overflow-hidden bg-white dark:bg-gray-800 transition-all hover:shadow-2xl">
        <CardContent className="p-0">
          <div className="p-6 sm:p-8">
            {children}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
