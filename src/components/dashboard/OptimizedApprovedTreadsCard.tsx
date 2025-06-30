
import { useNavigate } from "react-router-dom";
import { memo } from "react";

interface OptimizedApprovedTreadsCardProps {
  loaded: boolean;
  delay: number;
}

export const OptimizedApprovedTreadsCard = memo(({ loaded, delay }: OptimizedApprovedTreadsCardProps) => {
  const navigate = useNavigate();
  
  return (
    <div
      style={{
        opacity: loaded ? 1 : 0,
        transform: loaded ? 'translateY(0)' : 'translateY(20px)',
        transition: `all 0.5s ease ${delay}s`,
        willChange: 'transform, opacity'
      }}
      onClick={() => navigate('/approved-treads')}
      className="cursor-pointer relative"
    >
      <div className="group perspective-1000">
        <div 
          className="relative preserve-3d transition-transform duration-500 ease-out"
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
            className="w-full aspect-square rounded-lg border-2 border-green-400 transition-all duration-300 relative overflow-hidden"
            style={{
              boxShadow: '8px 8px 0px 0px rgba(0,0,0,0.3)',
              willChange: 'box-shadow'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '12px 12px 0px 0px rgba(0,0,0,0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '8px 8px 0px 0px rgba(0,0,0,0.3)';
            }}
          >
            {/* Background Image with lazy loading */}
            <img 
              src="/lovable-uploads/bebc10e4-cfd6-43f0-9264-dca5b271b7b0.png"
              alt="Approved Tire Tread List"
              className="w-full h-full object-cover rounded-lg"
              loading="lazy"
              style={{ willChange: 'transform' }}
            />
            
            {/* Hover overlay */}
            <div 
              className="absolute inset-0 bg-black bg-opacity-30 opacity-0 transition-opacity duration-300 rounded-lg flex items-center justify-center"
              style={{ willChange: 'opacity' }}
            >
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
    </div>
  );
});

OptimizedApprovedTreadsCard.displayName = 'OptimizedApprovedTreadsCard';
