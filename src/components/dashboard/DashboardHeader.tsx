
import { useAuth } from "@/contexts/AuthContext";
import { usePlant } from "@/contexts/PlantContext";
import { Building } from "lucide-react";

export function DashboardHeader() {
  const { user } = useAuth();
  const { selectedPlant } = usePlant();

  return (
    <header className="flex justify-between items-center mb-8">
      <div className="flex items-center space-x-4">
        <img 
          src="/lovable-uploads/fedbf726-afa3-477f-97ef-fa62b213c003.png" 
          alt="Conlan Tire Logo" 
          className="h-16 object-contain" 
        />
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">
            Welcome to Conlan Tire, {user?.store}
          </h1>
          <div className="flex items-center text-gray-600 mt-1">
            <Building className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">{selectedPlant}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
