
import { Navigation } from "@/components/Navigation";
import { WheelOrderForm } from "@/components/wheel-order/WheelOrderForm";

export default function WheelOrder() {
  return (
    <div 
      className="min-h-screen pb-8 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/lovable-uploads/895f00a4-0465-4649-977f-6a8e5534d95d.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <WheelOrderForm />
      </div>
    </div>
  );
}
