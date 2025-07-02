
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePlant } from "@/contexts/PlantContext";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardMenu } from "@/components/dashboard/DashboardMenu";
import { DashboardFooter } from "@/components/dashboard/DashboardFooter";
import { DashboardBanner } from "@/components/dashboard/DashboardBanner";
import { Building } from "lucide-react";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const { selectedPlant } = usePlant();
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);

  // Memoize plant display to prevent unnecessary re-renders
  const plantDisplay = useMemo(() => selectedPlant, [selectedPlant]);

  // Get store information from authenticated user
  const storeInfo = user?.storeManager;

  useEffect(() => {
    // Wait for auth to finish loading before checking user
    if (loading) return;
    
    if (!user) {
      console.log("No user found, redirecting to login");
      navigate('/login');
      return;
    }
    
    console.log("User authenticated, showing dashboard for:", storeInfo?.store_number || user.email);
    
    // Use requestIdleCallback for non-critical loading if available
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => setLoaded(true));
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => setLoaded(true), 50);
    }
  }, [user, loading, navigate, storeInfo]);

  // Show loading while auth is being checked
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if no user (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="container mx-auto">
        <DashboardHeader />

        <div className="flex flex-col justify-center items-center mb-10">
          <div className="flex items-center gap-2 p-2 px-4 rounded-full bg-blue-700/30 border border-blue-500 mb-4 animate-pulse">
            <Building className="h-5 w-5 text-amber-400" />
            <span className="font-bold text-amber-400">Currently at: {plantDisplay}</span>
          </div>
          
          {/* Display store manager information */}
          {storeInfo && (
            <div className="flex items-center gap-2 p-2 px-4 rounded-full bg-green-700/30 border border-green-500 mb-4">
              <span className="font-bold text-green-400">
                {storeInfo.name} - {storeInfo.title} at {storeInfo.store_number}
              </span>
            </div>
          )}
          
          <DashboardBanner />
        </div>

        <main>
          <DashboardMenu loaded={loaded} />
        </main>

        <DashboardFooter />
      </div>
    </div>
  );
}
