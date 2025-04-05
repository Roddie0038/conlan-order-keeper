
import { Navigation } from "@/components/Navigation";
import { WheelOrderForm } from "@/components/wheel-order/WheelOrderForm";

export default function WheelOrder() {
  return (
    <div className="min-h-screen bg-slate-900 pb-8 relative">
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img 
          src="/lovable-uploads/4f5861d2-62e8-4c91-bc6b-bcfcec6fb670.png" 
          alt="Wheel Powder Coating" 
          className="w-full h-full object-cover opacity-40 blur-[1px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-800/40"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <WheelOrderForm />
        </div>
      </div>
    </div>
  );
}
