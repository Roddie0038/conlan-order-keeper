
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Index from './pages/Index';
import Login from './pages/Login';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import PendingOrders from './pages/PendingOrders';
import AllPendingOrders from './pages/AllPendingOrders';
import CompletedOrders from './pages/CompletedOrders';
import OrderManagement from './pages/OrderManagement';
import Settings from './pages/Settings';
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

// Create a client
const queryClient = new QueryClient();

// Protected route wrapper that requires authentication
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
}

// Home redirect component that checks authentication
function HomeRedirect() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return <Navigate to={user ? "/dashboard" : "/auth"} replace />;
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
                <Route path="/auth" element={<Auth />} />
                <Route path="/login" element={<Navigate to="/auth" replace />} />
                <Route path="/transfer-request" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/pending-orders" element={<ProtectedRoute><PendingOrders /></ProtectedRoute>} />
                <Route path="/all-pending-orders" element={<ProtectedRoute><AllPendingOrders /></ProtectedRoute>} />
                <Route path="/completed-orders" element={<ProtectedRoute><CompletedOrders /></ProtectedRoute>} />
                <Route path="/order-management" element={<ProtectedRoute><OrderManagement /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/admin-inventory" element={<ProtectedRoute><AdminInventory /></ProtectedRoute>} />
                <Route path="/admin-orders" element={<ProtectedRoute><AdminOrders /></ProtectedRoute>} />
                <Route path="/all-orders" element={<ProtectedRoute><AllOrders /></ProtectedRoute>} />
                <Route path="/approved-treads" element={<ProtectedRoute><ApprovedTreads /></ProtectedRoute>} />
                <Route path="/relentless-inventory" element={<ProtectedRoute><RelentlessInventory /></ProtectedRoute>} />
                <Route path="/mto-order" element={<ProtectedRoute><MTOOrder /></ProtectedRoute>} />
                <Route path="/cross-dock" element={<ProtectedRoute><CrossDock /></ProtectedRoute>} />
                <Route path="/wheel-order" element={<ProtectedRoute><WheelOrder /></ProtectedRoute>} />
                <Route path="/retread-warranty" element={<ProtectedRoute><RetreadWarranty /></ProtectedRoute>} />
                <Route path="/complaint-tracking" element={<ProtectedRoute><ComplaintTracking /></ProtectedRoute>} />
                <Route path="/my-complaints" element={<ProtectedRoute><MyComplaints /></ProtectedRoute>} />
              </Routes>
            </ConditionalSidebar>
          </QueryClientProvider>
        </PlantProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
