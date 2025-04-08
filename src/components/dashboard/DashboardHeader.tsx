
import { useAuth } from "@/contexts/AuthContext";
import { usePlant } from "@/contexts/PlantContext";
import { Building } from "lucide-react";

export function DashboardHeader() {
  const { user } = useAuth();
  const { selectedPlant } = usePlant();

  return (
    <header className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
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
        </div>
      </div>
      <div className="flex items-center bg-gradient-to-r from-blue-700 to-blue-900 px-4 py-2 rounded-lg border-2 border-amber-400">
        <Building className="h-6 w-6 mr-2 text-amber-400" />
        <span className="text-xl font-bold text-white">Plant: <span className="text-amber-400">{selectedPlant}</span></span>
      </div>
    </header>
  );
}
