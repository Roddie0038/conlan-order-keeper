
import { Navigation } from "@/components/Navigation";
import { WheelOrderForm } from "@/components/wheel-order/WheelOrderForm";

export default function WheelOrder() {
  return (
    <div 
      className="min-h-screen pb-8"
      style={{
        backgroundImage: "url('/lovable-uploads/b6656b47-28a5-43d9-a97c-3a6ec454a631.png')",
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
