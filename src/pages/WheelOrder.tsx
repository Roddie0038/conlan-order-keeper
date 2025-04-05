
import { Navigation } from "@/components/Navigation";
import { WheelOrderForm } from "@/components/wheel-order/WheelOrderForm";

export default function WheelOrder() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 pb-8">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <WheelOrderForm />
      </div>
    </div>
  );
}
