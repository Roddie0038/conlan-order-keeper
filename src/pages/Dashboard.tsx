
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardMenu } from "@/components/dashboard/DashboardMenu";
import { DashboardFooter } from "@/components/dashboard/DashboardFooter";
import { DashboardBanner } from "@/components/dashboard/DashboardBanner";

export default function Dashboard() {
  const { user } = useAuth();
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

        <div className="flex justify-center mb-10">
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
