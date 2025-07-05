
import { motion } from "framer-motion";
import { usePlant } from "@/contexts/PlantContext";

export function DashboardBanner() {
  const { selectedPlant } = usePlant();
  
  // Determine which banner image to display based on the plant
  const getBannerImage = () => {
    if (selectedPlant === "Romulus 98") {
      return "/lovable-uploads/80253a3f-2864-4be4-a0f1-1c7bdb20b826.png";
    } else if (selectedPlant === "Mulberry 99") {
      return "/lovable-uploads/24736eac-5076-4f51-ad76-b6615849fe69.png";
    } else if (selectedPlant === "Grand Prairie 97") {
      return "/lovable-uploads/6ddbd3d3-6d33-4a42-97a8-746ec6d6767e.png";
    }
    // Default image for other plants
    return "/lovable-uploads/96697586-f8cf-4aa5-8415-fee779a6cd7b.png";
  };
  
  return (
    <motion.div 
      className="w-full max-w-5xl mx-auto mt-4 mb-8" 
      initial={{
        opacity: 0,
        y: 20
      }} 
      animate={{
        opacity: 1,
        y: 0
      }} 
      transition={{
        duration: 0.8
      }}
    >
      <div className="relative">
        <img 
          src={getBannerImage()} 
          alt={`${selectedPlant} - Conlan Tire`} 
          className="w-full h-auto rounded-lg shadow-2xl" 
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 rounded-b-lg">
          
        </div>
      </div>
    </motion.div>
  );
}
