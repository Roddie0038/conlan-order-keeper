
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { memo } from "react";

export interface MenuItemProps {
  title: string;
  icon: React.ReactNode;
  path: string;
  color: string;
  borderColor: string;
  delay: number;
  size: string;
  highlight?: boolean;
  backgroundImage?: string;
  hideTitle?: boolean;
  fullSizeImage?: boolean;
}

const MenuCardBackground = memo(({ backgroundImage, fullSizeImage, title }: {
  backgroundImage?: string;
  fullSizeImage?: boolean;
  title: string;
}) => {
  if (!backgroundImage) return null;

  return (
    <div 
      className={`
        absolute inset-0 z-0 bg-cover bg-center 
        ${fullSizeImage ? "opacity-100" : ""}
        ${!fullSizeImage && title === "MTO" ? "opacity-80 mix-blend-multiply" : ""}
        ${!fullSizeImage && title === "NEW ORDER" ? "opacity-70 mix-blend-overlay" : ""}
        ${!fullSizeImage && title === "ORDER MANAGEMENT" ? "opacity-90 mix-blend-hard-light" : ""}
        ${!fullSizeImage && !["MTO", "NEW ORDER", "ORDER MANAGEMENT", "WHEEL REFURB ORDER"].includes(title) ? "opacity-70 mix-blend-overlay" : ""}
      `}
      style={{ backgroundImage: `url(${backgroundImage})` }}
    />
  );
});

const MenuCard3DEffects = memo(({ title }: { title: string }) => {
  if (title === "WAREHOUSE INVENTORY") {
    return (
      <>
        <div className="absolute top-0 right-0 w-8 h-full transform translate-x-full origin-left rotate-y-90 bg-purple-800 rounded-r-lg"></div>
        <div className="absolute bottom-0 left-0 w-full h-8 transform translate-y-full origin-top rotate-x-90 bg-purple-900 rounded-b-lg"></div>
      </>
    );
  }
  
  if (title === "ORDER MANAGEMENT") {
    return (
      <>
        <div className="absolute top-0 right-0 w-8 h-full transform translate-x-full origin-left rotate-y-90 bg-red-800 rounded-r-lg"></div>
        <div className="absolute bottom-0 left-0 w-full h-8 transform translate-y-full origin-top rotate-x-90 bg-red-900 rounded-b-lg"></div>
      </>
    );
  }
  
  return (
    <>
      <div className="absolute top-0 right-0 w-6 h-full transform translate-x-full origin-left rotate-y-90 bg-black bg-opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-full h-6 transform translate-y-full origin-top rotate-x-90 bg-black bg-opacity-40"></div>
    </>
  );
});

export const OptimizedMenuCard = memo(({ item, loaded }: { item: MenuItemProps; loaded: boolean }) => {
  const navigate = useNavigate();
  
  const cardClasses = `
    w-full aspect-square flex flex-col items-center justify-center p-6 rounded-lg
    ${item.color ? `bg-gradient-to-br ${item.color}` : ''}
    border-2 ${item.borderColor}
    ${
      item.title === "WAREHOUSE INVENTORY"
        ? "border-4 border-purple-400 shadow-[0_10px_30px_rgba(138,43,226,0.3)]"
        : item.title === "ORDER MANAGEMENT"
        ? "border-4 border-yellow-400 shadow-[0_10px_30px_rgba(220,38,38,0.3)]"
        : "shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] group-hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,0.25)]"
    }
    transition-all duration-300
    relative overflow-hidden
  `;

  const titleClasses = `
    mt-3 font-bold text-center
    ${item.title === "NEW ORDER" || item.title === "MTO" ? "text-2xl" : ""}
    ${item.title === "PENDING ORDERS" || item.title === "COMPLETED ORDERS" ? "text-lg" : ""}
    ${item.title === "CROSS DOCK" ? "text-2xl" : ""}
    ${item.title === "WAREHOUSE INVENTORY" ? "text-2xl drop-shadow-[0_2px_4px_rgba(255,255,255,0.4)]" : ""}
    ${item.title === "ORDER MANAGEMENT" ? "text-2xl drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)] font-extrabold" : ""}
    text-white 
    ${item.title === "MTO" ? 
      "drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-extrabold text-blue-50" : 
      "drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"}
  `;
  
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
      style={{ willChange: 'transform' }}
    >
      <div className="group perspective-1000">
        <div className="relative preserve-3d transition-transform duration-500 ease-out group-hover:rotate-y-12 group-hover:rotate-x-12">
          <div className={cardClasses}>
            <MenuCardBackground 
              backgroundImage={item.backgroundImage}
              fullSizeImage={item.fullSizeImage}
              title={item.title}
            />
            
            {!item.fullSizeImage && (
              <div className="absolute inset-0 rounded-lg bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.1)_10px,rgba(0,0,0,0.1)_20px)]"></div>
            )}
            
            <div className="relative z-10 flex flex-col items-center justify-center h-full">
              {!item.hideTitle && item.icon && item.icon}
              
              {!item.hideTitle && (
                <h2 className={titleClasses}>
                  {item.title}
                </h2>
              )}
              
              <span className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white font-semibold">
                Click to Open &rarr;
              </span>
            </div>
          </div>

          <MenuCard3DEffects title={item.title} />
        </div>
      </div>
    </motion.div>
  );
});

OptimizedMenuCard.displayName = 'OptimizedMenuCard';
MenuCardBackground.displayName = 'MenuCardBackground';
MenuCard3DEffects.displayName = 'MenuCard3DEffects';
