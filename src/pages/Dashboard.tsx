import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardSidebar } from "@/components/dashboard/modern/DashboardSidebar";
import { DashboardTopBar } from "@/components/dashboard/modern/DashboardTopBar";
import { WelcomeHeader } from "@/components/dashboard/modern/WelcomeHeader";
import { DashboardSection } from "@/components/dashboard/modern/DashboardSection";
import { RequestButton } from "@/components/dashboard/modern/RequestButton";
import { RightPanel } from "@/components/dashboard/modern/RightPanel";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Package,
  Wrench,
  Shield,
  AlertTriangle,
  ArrowRightLeft,
  ClipboardList,
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
    <div className="min-h-screen bg-background flex">
      {/* Left Sidebar */}
      <DashboardSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <DashboardTopBar />

        {/* Main Content with Right Panel */}
        <div className="flex-1 flex overflow-hidden">
          {/* Central Content */}
          <main className="flex-1 overflow-y-auto p-8">
            <WelcomeHeader />

            <div className="space-y-6 max-w-5xl">
              {/* Make a Request Section */}
              <DashboardSection id="make-request" title="Make a Request">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <RequestButton
                    icon={ArrowRightLeft}
                    title="Transfer Request"
                    path="/transfer-request"
                  />
                  <RequestButton
                    icon={FileText}
                    title="MTO Request"
                    path="/mto-request"
                  />
                  <RequestButton
                    icon={Wrench}
                    title="Wheel Powder Coat Request"
                    path="/powder-coat-request"
                  />
                  <RequestButton
                    icon={Shield}
                    title="Warranty Submission"
                    path="/warranty-submission"
                  />
                  <RequestButton
                    icon={Package}
                    title="Cross-Dock Request"
                    path="/cross-dock-request"
                  />
                  <RequestButton
                    icon={AlertTriangle}
                    title="Customer Complaint"
                    path="/customer-complaint"
                    variant="warning"
                  />
                  <RequestButton
                    icon={ArrowRightLeft}
                    title="Regional Transfer Request"
                    path="/regional-transfer"
                  />
                </div>
              </DashboardSection>

              {/* Orders & Transfers Section */}
              <DashboardSection id="orders" title="Orders & Transfers">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-auto py-6 justify-start gap-3"
                    onClick={() => navigate("/all-orders")}
                  >
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">View All Orders</div>
                      <div className="text-xs text-muted-foreground">Browse order history</div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    className="h-auto py-6 justify-start gap-3"
                    onClick={() => navigate("/transfer-history")}
                  >
                    <div className="p-2 rounded-lg bg-primary/10">
                      <History className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">View Transfer History</div>
                      <div className="text-xs text-muted-foreground">Review past transfers</div>
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
                    className="h-auto py-6 justify-start gap-3"
                    onClick={() => navigate("/approved-tread-list")}
                  >
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileCheck className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">Approved Tire Tread List</div>
                      <div className="text-xs text-muted-foreground">View approved products</div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    className="h-auto py-6 justify-start gap-3"
                    onClick={() => navigate("/cross-dock-printable")}
                  >
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Printer className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">Cross-Dock Printable Forms</div>
                      <div className="text-xs text-muted-foreground">Download forms</div>
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
                      path="/user-management"
                    />
                    <RequestButton
                      icon={Mail}
                      title="Email Routing Tools"
                      path="/email-routing"
                    />
                    <RequestButton
                      icon={TestTube}
                      title="Test Suite"
                      path="/test-suite"
                    />
                    <RequestButton
                      icon={ToggleLeft}
                      title="Feature Toggles"
                      path="/feature-toggles"
                    />
                    <RequestButton
                      icon={FileType}
                      title="Templates"
                      path="/templates"
                    />
                  </div>
                </DashboardSection>
              )}
            </div>
          </main>

          {/* Right Panel */}
          <div className="border-l border-border p-6 overflow-y-auto">
            <RightPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
