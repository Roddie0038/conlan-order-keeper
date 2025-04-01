
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

export interface MenuItemProps {
  title: string;
  icon: React.ReactNode;
  path: string;
  color: string;
  borderColor: string;
  delay: number;
  size: string;
  highlight?: boolean;
}

export function MenuCard({ item, loaded }: { item: MenuItemProps; loaded: boolean }) {
  const navigate = useNavigate();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={loaded ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: item.delay }}
      onClick={() => navigate(item.path)}
      className={`
        cursor-pointer relative
        ${item.size || ""}
        ${item.highlight ? 'ring-2 ring-purple-300 ring-opacity-50 shadow-lg shadow-purple-500/20' : ''}
      `}
    >
      <div className="group perspective-1000">
        <div
          className={`
            relative preserve-3d transition-transform duration-500 ease-out group-hover:rotate-y-12 group-hover:rotate-x-12
            ${item.title === "WAREHOUSE INVENTORY" ? "transform-style-3d shadow-[0_20px_50px_rgba(138,43,226,0.4)]" : ""}
            ${item.title === "ORDER MANAGEMENT" ? "transform-style-3d shadow-[0_20px_50px_rgba(220,38,38,0.4)]" : ""}
          `}
        >
          <div
            className={`
              w-full aspect-square flex flex-col items-center justify-center p-6 rounded-lg
              bg-gradient-to-br ${item.color}
              border-2 ${item.borderColor}
              ${
                item.title === "WAREHOUSE INVENTORY"
                  ? "border-4 border-purple-400 shadow-[0_10px_30px_rgba(138,43,226,0.3)]"
                  : item.title === "ORDER MANAGEMENT"
                  ? "border-4 border-yellow-400 shadow-[0_10px_30px_rgba(220,38,38,0.3)]"
                  : "shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] group-hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,0.25)]"
              }
              transition-all duration-300
            `}
          >
            <div className="absolute inset-0 rounded-lg bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.1)_10px,rgba(0,0,0,0.1)_20px)]"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              {item.icon}
              <h2
                className={`
                  mt-3 font-bold text-center
                  ${item.title === "NEW ORDER" || item.title === "MTO" ? "text-2xl" : ""}
                  ${item.title === "PENDING ORDERS" || item.title === "COMPLETED ORDERS" ? "text-lg" : ""}
                  ${item.title === "CROSS DOCK" ? "text-2xl" : ""}
                  ${item.title === "WAREHOUSE INVENTORY" ? "text-2xl drop-shadow-[0_2px_4px_rgba(255,255,255,0.4)]" : ""}
                  ${item.title === "ORDER MANAGEMENT" ? "text-2xl drop-shadow-[0_2px_4px_rgba(255,255,255,0.4)]" : ""}
                `}
              >
                {item.title}
              </h2>
              <span className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white font-semibold">
                Click to Open &rarr;
              </span>
            </div>
          </div>

          {item.title === "WAREHOUSE INVENTORY" && (
            <>
              <div className="absolute top-0 right-0 w-8 h-full transform translate-x-full origin-left rotate-y-90 bg-purple-800 rounded-r-lg"></div>
              <div className="absolute bottom-0 left-0 w-full h-8 transform translate-y-full origin-top rotate-x-90 bg-purple-900 rounded-b-lg"></div>
            </>
          )}
          {item.title === "ORDER MANAGEMENT" && (
            <>
              <div className="absolute top-0 right-0 w-8 h-full transform translate-x-full origin-left rotate-y-90 bg-red-800 rounded-r-lg"></div>
              <div className="absolute bottom-0 left-0 w-full h-8 transform translate-y-full origin-top rotate-x-90 bg-red-900 rounded-b-lg"></div>
            </>
          )}
          {item.title !== "WAREHOUSE INVENTORY" && item.title !== "ORDER MANAGEMENT" && (
            <>
              <div className="absolute top-0 right-0 w-6 h-full transform translate-x-full origin-left rotate-y-90 bg-black bg-opacity-30"></div>
              <div className="absolute bottom-0 left-0 w-full h-6 transform translate-y-full origin-top rotate-x-90 bg-black bg-opacity-40"></div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
