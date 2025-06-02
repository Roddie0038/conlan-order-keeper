
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PlantProvider } from "@/contexts/PlantContext";
import { InventoryProvider } from "@/contexts/InventoryContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PendingOrders from "./pages/PendingOrders";
import CompletedOrders from "./pages/CompletedOrders";
import OrderManagement from "./pages/OrderManagement";
import AdminOrders from "./pages/AdminOrders";
import AllOrders from "./pages/AllOrders";
import AllPendingOrders from "./pages/AllPendingOrders";
import ApprovedTreads from "./pages/ApprovedTreads";
import RelentlessInventory from "./pages/RelentlessInventory";
import AdminInventory from "./pages/AdminInventory";
import CrossDock from "./pages/CrossDock";
import MTOOrder from "./pages/MTOOrder";
import WheelOrder from "./pages/WheelOrder";
import RetreadWarranty from "./pages/RetreadWarranty";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <PlantProvider>
              <InventoryProvider>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/pending-orders" element={<PendingOrders />} />
                  <Route path="/completed-orders" element={<CompletedOrders />} />
                  <Route path="/order-management" element={<OrderManagement />} />
                  <Route path="/admin-orders" element={<AdminOrders />} />
                  <Route path="/all-orders" element={<AllOrders />} />
                  <Route path="/all-pending-orders" element={<AllPendingOrders />} />
                  <Route path="/approved-treads" element={<ApprovedTreads />} />
                  <Route path="/relentless-inventory" element={<RelentlessInventory />} />
                  <Route path="/admin-inventory" element={<AdminInventory />} />
                  <Route path="/cross-dock" element={<CrossDock />} />
                  <Route path="/mto-order" element={<MTOOrder />} />
                  <Route path="/wheel-order" element={<WheelOrder />} />
                  <Route path="/retread-warranty" element={<RetreadWarranty />} />
                </Routes>
              </InventoryProvider>
            </PlantProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
