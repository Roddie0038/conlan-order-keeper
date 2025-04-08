
import { motion } from "framer-motion";
import { usePlant } from "@/contexts/PlantContext";
import { Building } from "lucide-react";

export const CrossDockHeader = () => {
  const { selectedPlant } = usePlant();
  
  return (
    <>
      {/* Form Header with Plant name if available */}
      {selectedPlant && (
        <div className="bg-slate-100 p-2 text-center print-hide">
          <span className="text-sm font-medium text-slate-700">
            Currently working with: <span className="font-bold">{selectedPlant}</span>
          </span>
        </div>
      )}
      
      <div className="text-center space-y-3 p-6 border-b">
        <h2 className="font-bold text-3xl text-gray-800">Cross Dock Form</h2>
        <p className="text-sm text-gray-600 max-w-2xl mx-auto">
          Use this form when sending tires/material to another store using the Warehouse as a cross dock location.
        </p>
      </div>
    </>
  );
};
