
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";

interface ApprovedTreadsCardProps {
  loaded: boolean;
  delay: number;
}

export function ApprovedTreadsCard({ loaded, delay }: ApprovedTreadsCardProps) {
  const navigate = useNavigate();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={loaded ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      onClick={() => navigate('/approved-treads')}
      className="cursor-pointer relative"
    >
      <div className="group perspective-1000">
        <div className="relative preserve-3d transition-transform duration-500 ease-out group-hover:rotate-y-12 group-hover:rotate-x-12">
          <div className="w-full aspect-square flex flex-col items-center justify-center p-6 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-green-400 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] group-hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,0.25)] transition-all duration-300 relative overflow-hidden">
            
            {/* Background Pattern */}
            <div className="absolute inset-0 rounded-lg bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.1)_10px,rgba(0,0,0,0.1)_20px)]"></div>
            
            <div className="relative z-10 flex flex-col items-center justify-center h-full">
              <FileText className="h-12 w-12 text-green-400 mb-4" />
              
              <h2 className="text-2xl font-bold text-center text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                APPROVED TREADS
              </h2>
              
              <span className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white font-semibold">
                View Reference &rarr;
              </span>
            </div>
          </div>

          {/* 3D Effect Sides */}
          <div className="absolute top-0 right-0 w-6 h-full transform translate-x-full origin-left rotate-y-90 bg-black bg-opacity-30"></div>
          <div className="absolute bottom-0 left-0 w-full h-6 transform translate-y-full origin-top rotate-x-90 bg-black bg-opacity-40"></div>
        </div>
      </div>
    </motion.div>
  );
}
