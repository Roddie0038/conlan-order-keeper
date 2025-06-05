
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { MyComplaints } from "@/components/complaint/MyComplaints";
import { Building } from "lucide-react";
import { usePlant } from "@/contexts/PlantContext";

export default function MyComplaintsPage() {
  const { user, loading } = useAuth();
  const { selectedPlant } = usePlant();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      console.log("No user found, redirecting to login");
      navigate('/login');
      return;
    }

    // Redirect admin users to order management instead
    if (user.isAdmin) {
      navigate('/order-management');
      return;
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading your complaints...</p>
        </div>
      </div>
    );
  }

  if (!user || user.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <header className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-8 mb-8 shadow-md">
        <div className="container mx-auto px-4 flex flex-col items-center gap-6">
          <img 
            src="/lovable-uploads/fedbf726-afa3-477f-97ef-fa62b213c003.png" 
            alt="Conlan Tire Logo" 
            className="h-20 object-contain"
          />
          <h1 className="text-3xl md:text-4xl font-bold text-center">My Complaints</h1>
          <div className="flex items-center gap-2 py-2 px-4 bg-blue-800/60 rounded-full border border-blue-500 shadow-inner">
            <Building className="h-5 w-5 text-amber-400" />
            <span className="font-bold text-amber-400">{selectedPlant}</span>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <MyComplaints />
      </main>
      
      <footer className="mt-16 py-6 text-center text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-black/20 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto">
          <p>© {new Date().getFullYear()} Conlan Tire. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
