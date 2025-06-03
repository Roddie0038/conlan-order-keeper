
import { NationalWarrantyForm } from "@/components/warranty-form/NationalWarrantyForm";

export default function NationalWarranty() {
  return (
    <div className="min-h-screen relative">
      {/* Caution stripe background pattern */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div 
          className="w-full h-full"
          style={{
            background: `repeating-linear-gradient(
              -45deg,
              #fbbf24 0px,
              #fbbf24 20px,
              #000000 20px,
              #000000 40px
            )`
          }}
        />
      </div>
      
      {/* Content overlay */}
      <div className="relative z-10 bg-gray-50/90 min-h-screen">
        <NationalWarrantyForm />
      </div>
    </div>
  );
}
