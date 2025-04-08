
import { useAuth } from "@/contexts/AuthContext";
import { usePlant } from "@/contexts/PlantContext";
import { Building } from "lucide-react";

export function PendingOrdersHeader() {
  const { user } = useAuth();
  const { selectedPlant } = usePlant();

  return (
    <header className="bg-primary/90 text-primary-foreground py-6 mb-8 backdrop-blur-sm rounded-full">
      <div className="container flex justify-between items-center">
        <div className="flex items-center gap-4">
          <img 
            alt="Conlan Tire Logo" 
            className="h-16 object-contain rounded-full" 
            src="/lovable-uploads/1691138e-da6c-4910-8901-00cd0ab21fa8.png" 
          />
          <div>
            <h1 className="font-extrabold text-4xl text-justify px-[29px]">New Order Form - {user?.store}</h1>
            <div className="flex items-center text-gray-200 px-[29px] mt-1">
              <Building className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">{selectedPlant}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
