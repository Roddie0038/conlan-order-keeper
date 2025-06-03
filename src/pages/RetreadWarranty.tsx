
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
        <div className="container mx-auto px-4 py-8">
          <RetreadWarrantyForm />
        </div>
      </div>
    </div>
  );
}
