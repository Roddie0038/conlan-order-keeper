
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Index from './pages/Index';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
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
import ComplaintTracking from './pages/ComplaintTracking';
import MyComplaints from './pages/MyComplaints';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PlantProvider } from './contexts/PlantContext';
import { Toaster } from "@/components/ui/toaster"
import { ConditionalSidebar } from './components/ConditionalSidebar';
import { RequireAuth } from './components/auth/RequireAuth';
import EmailTestingSuite from "./pages/EmailTestingSuite";

// Create a client
const queryClient = new QueryClient();

// Home redirect component that checks authentication
function HomeRedirect() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  return <Navigate to={user ? "/dashboard" : "/login"} replace />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <PlantProvider>
          <QueryClientProvider client={queryClient}>
            <Toaster />
            <ConditionalSidebar>
              <Routes>
                <Route path="/" element={<HomeRedirect />} />
                <Route path="/transfer-request" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route
                  path="/dashboard"
                  element={
                    <RequireAuth>
                      <Dashboard />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/pending-orders"
                  element={
                    <RequireAuth>
                      <PendingOrders />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/all-pending-orders"
                  element={
                    <RequireAuth>
                      <AllPendingOrders />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/completed-orders"
                  element={
                    <RequireAuth>
                      <CompletedOrders />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/order-management"
                  element={
                    <RequireAuth>
                      <OrderManagement />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/admin-inventory"
                  element={
                    <RequireAuth>
                      <AdminInventory />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/admin-orders"
                  element={
                    <RequireAuth>
                      <AdminOrders />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/all-orders"
                  element={
                    <RequireAuth>
                      <AllOrders />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/approved-treads"
                  element={
                    <RequireAuth>
                      <ApprovedTreads />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/relentless-inventory"
                  element={
                    <RequireAuth>
                      <RelentlessInventory />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/mto-order"
                  element={
                    <RequireAuth>
                      <MTOOrder />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/cross-dock"
                  element={
                    <RequireAuth>
                      <CrossDock />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/wheel-order"
                  element={
                    <RequireAuth>
                      <WheelOrder />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/retread-warranty"
                  element={
                    <RequireAuth>
                      <RetreadWarranty />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/complaint-tracking"
                  element={
                    <RequireAuth>
                      <ComplaintTracking />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/my-complaints"
                  element={
                    <RequireAuth>
                      <MyComplaints />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/email-testing"
                  element={
                    <RequireAuth>
                      <EmailTestingSuite />
                    </RequireAuth>
                  }
                />
              </Routes>
            </ConditionalSidebar>
          </QueryClientProvider>
        </PlantProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
