
import { Navigation } from "@/components/Navigation";
import { WheelOrderForm } from "@/components/wheel-order/WheelOrderForm";

export default function WheelOrder() {
  return (
    <div 
      className="min-h-screen pb-8"
      style={{
        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/lovable-uploads/36bc55bd-d864-4b79-aece-28d9225de639.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 0
      }}
    >
      <div className="relative z-10">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <WheelOrderForm />
        </div>
      </div>
    </div>
  );
}
