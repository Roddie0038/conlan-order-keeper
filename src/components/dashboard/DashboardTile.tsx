
import { useNavigate } from "react-router-dom";
import { memo } from "react";

export interface DashboardTileProps {
  title: string;
  icon?: React.ReactNode;
  path: string;
  color?: string;
  borderColor: string;
  delay: number;
  size: string;
  highlight?: boolean;
  backgroundImage?: string;
  hideTitle?: boolean;
  fullSizeImage?: boolean;
  loaded: boolean;
}

export const DashboardTile = memo(({ 
  title, 
  icon, 
  path, 
  color = "", 
  borderColor, 
  delay, 
  size, 
  highlight = false, 
  backgroundImage, 
  hideTitle = false, 
  fullSizeImage = false,
  loaded 
}: DashboardTileProps) => {
  const navigate = useNavigate();
  
  return (
    <div
      style={{
        opacity: loaded ? 1 : 0,
        transform: loaded ? 'translateY(0)' : 'translateY(20px)',
        transition: `all 0.5s ease ${delay}s`,
        willChange: 'transform, opacity'
      }}
      onClick={() => navigate(path)}
      className={`
        cursor-pointer relative
        ${size || ""}
        ${highlight ? 'ring-2 ring-purple-300 ring-opacity-50 shadow-lg shadow-purple-500/20' : ''}
      `}
    >
      <div className="group perspective-1000">
        <div
          className={`
            relative preserve-3d transition-transform duration-500 ease-out 
            ${title === "WAREHOUSE INVENTORY" ? "transform-style-3d shadow-[0_20px_50px_rgba(138,43,226,0.4)]" : ""}
            ${title === "ORDER MANAGEMENT" ? "transform-style-3d shadow-[0_20px_50px_rgba(220,38,38,0.4)]" : ""}
          `}
          style={{
            willChange: 'transform',
            transform: 'translateZ(0)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'rotateY(12deg) rotateX(12deg) translateZ(0)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateZ(0)';
          }}
        >
          <div
            className={`
              w-full aspect-square flex flex-col items-center justify-center p-6 rounded-lg
              ${color ? `bg-gradient-to-br ${color}` : ''}
              border-2 ${borderColor}
              ${
                title === "WAREHOUSE INVENTORY"
                  ? "border-4 border-purple-400 shadow-[0_10px_30px_rgba(138,43,226,0.3)]"
                  : title === "ORDER MANAGEMENT"
                  ? "border-4 border-yellow-400 shadow-[0_10px_30px_rgba(220,38,38,0.3)]"
                  : "shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)]"
              }
              transition-all duration-300
              relative overflow-hidden
            `}
            style={{
              willChange: 'box-shadow, transform'
            }}
            onMouseEnter={(e) => {
              if (!title.includes("WAREHOUSE INVENTORY") && !title.includes("ORDER MANAGEMENT")) {
                e.currentTarget.style.boxShadow = '12px 12px 0px 0px rgba(0,0,0,0.25)';
              }
            }}
            onMouseLeave={(e) => {
              if (!title.includes("WAREHOUSE INVENTORY") && !title.includes("ORDER MANAGEMENT")) {
                e.currentTarget.style.boxShadow = '8px 8px 0px 0px rgba(0,0,0,0.3)';
              }
            }}
          >
            {/* Background AI Image with lazy loading */}
            {backgroundImage && (
              <div 
                className={`
                  absolute inset-0 z-0 bg-cover bg-center 
                  ${fullSizeImage ? "opacity-100" : ""}
                  ${!fullSizeImage && title === "MTO" ? "opacity-80 mix-blend-multiply" : ""}
                  ${!fullSizeImage && title === "NEW ORDER" ? "opacity-70 mix-blend-overlay" : ""}
                  ${!fullSizeImage && title === "ORDER MANAGEMENT" ? "opacity-90 mix-blend-hard-light" : ""}
                  ${!fullSizeImage && !["MTO", "NEW ORDER", "ORDER MANAGEMENT", "WHEEL REFURB ORDER"].includes(title) ? "opacity-70 mix-blend-overlay" : ""}
                `}
                style={{ 
                  backgroundImage: `url(${backgroundImage})`,
                  willChange: 'transform'
                }}
              />
            )}
            
            {/* Only add the overlay pattern if it's not a full size image */}
            {!fullSizeImage && (
              <div className="absolute inset-0 rounded-lg bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.1)_10px,rgba(0,0,0,0.1)_20px)]"></div>
            )}
            
            <div className="relative z-10 flex flex-col items-center justify-center h-full">
              {/* Only show icon if it exists and title is not hidden */}
              {!hideTitle && icon && icon}
              
              {/* Only show title if not hidden */}
              {!hideTitle && (
                <h2
                  className={`
                    mt-3 font-bold text-center
                    ${title === "NEW ORDER" || title === "MTO" ? "text-2xl" : ""}
                    ${title === "PENDING ORDERS" || title === "COMPLETED ORDERS" ? "text-lg" : ""}
                    ${title === "CROSS DOCK" ? "text-2xl" : ""}
                    ${title === "WAREHOUSE INVENTORY" ? "text-2xl drop-shadow-[0_2px_4px_rgba(255,255,255,0.4)]" : ""}
                    ${title === "ORDER MANAGEMENT" ? "text-2xl drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)] font-extrabold" : ""}
                    text-white 
                    ${title === "MTO" ? 
                      "drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-extrabold text-blue-50" : 
                      "drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"}
                  `}
                >
                  {title}
                </h2>
              )}
              
              <span 
                className="mt-4 opacity-0 transition-opacity duration-300 text-white font-semibold group-hover:opacity-100"
                style={{ willChange: 'opacity' }}
              >
                Click to Open &rarr;
              </span>
            </div>
          </div>

          {/* 3D Effect Sides */}
          {title === "WAREHOUSE INVENTORY" && (
            <>
              <div className="absolute top-0 right-0 w-8 h-full transform translate-x-full origin-left rotate-y-90 bg-purple-800 rounded-r-lg"></div>
              <div className="absolute bottom-0 left-0 w-full h-8 transform translate-y-full origin-top rotate-x-90 bg-purple-900 rounded-b-lg"></div>
            </>
          )}
          {title === "ORDER MANAGEMENT" && (
            <>
              <div className="absolute top-0 right-0 w-8 h-full transform translate-x-full origin-left rotate-y-90 bg-red-800 rounded-r-lg"></div>
              <div className="absolute bottom-0 left-0 w-full h-8 transform translate-y-full origin-top rotate-x-90 bg-red-900 rounded-b-lg"></div>
            </>
          )}
          {title !== "WAREHOUSE INVENTORY" && title !== "ORDER MANAGEMENT" && (
            <>
              <div className="absolute top-0 right-0 w-6 h-full transform translate-x-full origin-left rotate-y-90 bg-black bg-opacity-30"></div>
              <div className="absolute bottom-0 left-0 w-full h-6 transform translate-y-full origin-top rotate-x-90 bg-black bg-opacity-40"></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

DashboardTile.displayName = 'DashboardTile';
