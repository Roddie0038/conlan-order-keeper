
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import RetreadWarrantyForm from "@/components/warranty-form/RetreadWarrantyForm";

export default function RetreadWarranty() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with caution stripe pattern */}
      <div className="absolute inset-0 bg-black">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 20px,
              #ff8c00 20px,
              #ff8c00 40px
            )`
          }}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 py-8">
        <div className="container mx-auto px-4">
          <RetreadWarrantyForm />
        </div>
      </div>
    </div>
  );
}
