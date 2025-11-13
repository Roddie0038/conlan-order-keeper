import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardSidebar } from "@/components/dashboard/modern/DashboardSidebar";
import { DashboardTopBar } from "@/components/dashboard/modern/DashboardTopBar";
import { WelcomeHeader } from "@/components/dashboard/modern/WelcomeHeader";
import { DashboardSection } from "@/components/dashboard/modern/DashboardSection";
import { RequestButton } from "@/components/dashboard/modern/RequestButton";
import { RightPanel } from "@/components/dashboard/modern/RightPanel";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import {
  FileText,
  Package,
  Wrench,
  Shield,
  AlertTriangle,
  ArrowRightLeft,
  History,
  FileCheck,
  Printer,
  Users,
  Mail,
  TestTube,
  ToggleLeft,
  FileType,
} from "lucide-react";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      console.log("No user found, redirecting to login");
      navigate('/login');
      return;
    }
    
    console.log("User authenticated, showing dashboard");
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex">
      {/* Left Sidebar */}
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <DashboardTopBar onMenuClick={() => setSidebarOpen(true)} />

        {/* Main Content with Right Panel */}
        <div className="flex-1 flex overflow-hidden">
          {/* Central Content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <WelcomeHeader />

            <div className="space-y-6 max-w-5xl">
              {/* Make a Request Section */}
              <DashboardSection id="make-request" title="Make a Request">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <RequestButton
                    icon={ArrowRightLeft}
                    title="Transfer Request"
                    path={ROUTES.transferRequest}
                  />
                  <RequestButton
                    icon={FileText}
                    title="MTO Request"
                    path={ROUTES.mtoRequest}
                  />
                  <RequestButton
                    icon={Wrench}
                    title="Wheel Powder Coat Request"
                    path={ROUTES.wheelPowderCoat}
                  />
                  <RequestButton
                    icon={Shield}
                    title="Warranty Submission"
                    path={ROUTES.warrantySubmission}
                  />
                  <RequestButton
                    icon={Package}
                    title="Cross-Dock Request"
                    path={ROUTES.crossDockRequest}
                  />
                  <RequestButton
                    icon={AlertTriangle}
                    title="Customer Complaint"
                    path={ROUTES.customerComplaint}
                    variant="warning"
                  />
                  <RequestButton
                    icon={ArrowRightLeft}
                    title="Regional Transfer Request"
                    path={ROUTES.regionalTransfer}
                  />
                </div>
              </DashboardSection>

              {/* Orders & Transfers Section */}
              <DashboardSection id="orders" title="Orders & Transfers">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-auto py-6 justify-start gap-3 bg-slate-800/40 border-white/10 hover:bg-slate-800/60 hover:border-white/20 text-white transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20"
                    onClick={() => navigate(ROUTES.orders)}
                  >
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-600/30">
                      <Package className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-white">View All Orders</div>
                      <div className="text-xs text-slate-400">Browse order history</div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    className="h-auto py-6 justify-start gap-3 bg-slate-800/40 border-white/10 hover:bg-slate-800/60 hover:border-white/20 text-white transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20"
                    onClick={() => navigate(ROUTES.transferHistory)}
                  >
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-600/30">
                      <History className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-white">View Transfer History</div>
                      <div className="text-xs text-slate-400">Review past transfers</div>
                    </div>
                  </Button>
                </div>
              </DashboardSection>

              {/* Tools & Resources Section */}
              <DashboardSection id="tools" title="Tools & Resources">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-auto py-6 justify-start gap-3 bg-slate-800/40 border-white/10 hover:bg-slate-800/60 hover:border-white/20 text-white transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20"
                    onClick={() => navigate(ROUTES.approvedTread)}
                  >
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-600/30">
                      <FileCheck className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-white">Approved Tire Tread List</div>
                      <div className="text-xs text-slate-400">View approved products</div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    className="h-auto py-6 justify-start gap-3 bg-slate-800/40 border-white/10 hover:bg-slate-800/60 hover:border-white/20 text-white transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20"
                    onClick={() => navigate(ROUTES.crossDockForms)}
                  >
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-600/30">
                      <Printer className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-white">Cross-Dock Printable Forms</div>
                      <div className="text-xs text-slate-400">Download forms</div>
                    </div>
                  </Button>
                </div>
              </DashboardSection>

              {/* Admin Dashboard Section - Conditional */}
              {user.isAdmin && (
                <DashboardSection id="admin" title="Admin Dashboard" defaultOpen={false}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <RequestButton
                      icon={Users}
                      title="User Management"
                      path={ROUTES.userManagement}
                    />
                    <RequestButton
                      icon={Mail}
                      title="Email Routing Tools"
                      path={ROUTES.emailRouting}
                    />
                    <RequestButton
                      icon={TestTube}
                      title="Test Suite"
                      path={ROUTES.testSuite}
                    />
                    <RequestButton
                      icon={ToggleLeft}
                      title="Feature Toggles"
                      path={ROUTES.featureToggles}
                    />
                    <RequestButton
                      icon={FileType}
                      title="Templates"
                      path={ROUTES.templates}
                    />
                  </div>
                </DashboardSection>
              )}
            </div>
          </main>

          {/* Right Panel - Hidden on mobile/tablet */}
          <div className="hidden xl:block border-l border-white/10 p-6 overflow-y-auto bg-slate-950/30">
            <RightPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
