
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePlant } from "@/contexts/PlantContext";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardMenu } from "@/components/dashboard/DashboardMenu";
import { DashboardFooter } from "@/components/dashboard/DashboardFooter";
import { DashboardBanner } from "@/components/dashboard/DashboardBanner";
import { Building } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const { selectedPlant } = usePlant();
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="container mx-auto">
        <DashboardHeader />

        <div className="flex flex-col justify-center items-center mb-10">
          <div className="flex items-center gap-2 p-2 px-4 rounded-full bg-blue-700/30 border border-blue-500 mb-4 animate-pulse">
            <Building className="h-5 w-5 text-amber-400" />
            <span className="font-bold text-amber-400">Currently at: {selectedPlant}</span>
          </div>
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
