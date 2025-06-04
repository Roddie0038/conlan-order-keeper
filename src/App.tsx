import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from './contexts/AuthContext';
import { PlantProvider } from './contexts/PlantContext';
import { InventoryProvider } from './contexts/InventoryContext';
import Index from './pages/Index';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import OrderForm from './pages/OrderForm';
import PendingOrders from './pages/PendingOrders';
import CompletedOrders from './pages/CompletedOrders';
import AllOrders from './pages/AllOrders';
import AllPendingOrders from './pages/AllPendingOrders';
import CrossDock from './pages/CrossDock';
import MTOOrder from './pages/MTOOrder';
import WheelOrder from './pages/WheelOrder';
import RetreadWarranty from './pages/RetreadWarranty';
import AdminInventory from './pages/AdminInventory';
import AdminOrders from './pages/AdminOrders';
import RelentlessInventory from './pages/RelentlessInventory';
import OrderManagement from './pages/OrderManagement';
import ApprovedTreads from './pages/ApprovedTreads';
import ConditionalSidebar from './components/ConditionalSidebar';
import { Toaster } from "@/components/ui/toaster"

import ComplaintTracking from "./pages/ComplaintTracking";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PlantProvider>
          <InventoryProvider>
            <BrowserRouter>
              <div className="min-h-screen bg-gray-50">
                <ConditionalSidebar />
                <div className="flex flex-col min-h-screen">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/order-form" element={<OrderForm />} />
                    <Route path="/pending-orders" element={<PendingOrders />} />
                    <Route path="/completed-orders" element={<CompletedOrders />} />
                    <Route path="/all-orders" element={<AllOrders />} />
                    <Route path="/all-pending-orders" element={<AllPendingOrders />} />
                    <Route path="/cross-dock" element={<CrossDock />} />
                    <Route path="/mto-order" element={<MTOOrder />} />
                    <Route path="/wheel-order" element={<WheelOrder />} />
                    <Route path="/retread-warranty" element={<RetreadWarranty />} />
                    <Route path="/admin-inventory" element={<AdminInventory />} />
                    <Route path="/admin-orders" element={<AdminOrders />} />
                    <Route path="/relentless-inventory" element={<RelentlessInventory />} />
                    <Route path="/order-management" element={<OrderManagement />} />
                    <Route path="/approved-treads" element={<ApprovedTreads />} />
                    <Route path="/complaint-tracking" element={<ComplaintTracking />} />
                  </Routes>
                </div>
              </div>
              <Toaster />
            </BrowserRouter>
          </InventoryProvider>
        </PlantProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
