
import { Navigation } from "@/components/Navigation";
import { WheelOrderForm } from "@/components/wheel-order/WheelOrderForm";

export default function WheelOrder() {
  return (
    <div 
      className="min-h-screen pb-8 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/lovable-uploads/44142b67-cff4-4675-892d-0b0dfb2c7623.png')",
      }}
    >
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <WheelOrderForm />
      </div>
    </div>
  );
}
