
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

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
          <div className="w-full aspect-square rounded-lg border-2 border-green-400 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] group-hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,0.25)] transition-all duration-300 relative overflow-hidden">
            
            {/* Background Image */}
            <img 
              src="/lovable-uploads/bebc10e4-cfd6-43f0-9264-dca5b271b7b0.png"
              alt="Approved Tire Tread List"
              className="w-full h-full object-cover rounded-lg"
            />
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                View Treads &rarr;
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
