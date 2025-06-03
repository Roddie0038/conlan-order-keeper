
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Index from './pages/Index';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PendingOrders from './pages/PendingOrders';
import AllPendingOrders from './pages/AllPendingOrders';
import CompletedOrders from './pages/CompletedOrders';
import OrderManagement from './pages/OrderManagement';
import AdminInventory from './pages/AdminInventory';
import AdminOrders from './pages/AdminOrders';
import AllOrders from './pages/AllOrders';
import ApprovedTreads from './pages/ApprovedTreads';
import RelentlessInventory from './pages/RelentlessInventory';
import MTOOrder from './pages/MTOOrder';
import CrossDock from './pages/CrossDock';
import WheelOrder from './pages/WheelOrder';
import RetreadWarranty from './pages/RetreadWarranty';
import NationalWarranty from './pages/NationalWarranty';
import { AuthProvider } from './contexts/AuthContext';
import { PlantProvider } from './contexts/PlantContext';
import { Toaster } from "@/components/ui/toaster"
import { ConditionalSidebar } from './components/ConditionalSidebar';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <Router>
      <AuthProvider>
        <PlantProvider>
          <QueryClientProvider client={queryClient}>
            <Toaster />
            <ConditionalSidebar>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/pending-orders" element={<PendingOrders />} />
                <Route path="/all-pending-orders" element={<AllPendingOrders />} />
                <Route path="/completed-orders" element={<CompletedOrders />} />
                <Route path="/order-management" element={<OrderManagement />} />
                <Route path="/admin-inventory" element={<AdminInventory />} />
                <Route path="/admin-orders" element={<AdminOrders />} />
                <Route path="/all-orders" element={<AllOrders />} />
                <Route path="/approved-treads" element={<ApprovedTreads />} />
                <Route path="/relentless-inventory" element={<RelentlessInventory />} />
                <Route path="/mto-order" element={<MTOOrder />} />
                <Route path="/cross-dock" element={<CrossDock />} />
                <Route path="/wheel-order" element={<WheelOrder />} />
                <Route path="/retread-warranty" element={<RetreadWarranty />} />
                <Route path="/national-warranty" element={<NationalWarranty />} />
              </Routes>
            </ConditionalSidebar>
          </QueryClientProvider>
        </PlantProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
