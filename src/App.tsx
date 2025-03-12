
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Navigation } from "./components/Navigation";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PendingOrders from "./pages/PendingOrders";
import CompletedOrders from "./pages/CompletedOrders";
import MTOOrder from "./pages/MTOOrder";
import CrossDock from "./pages/CrossDock";
import AllPendingOrders from "./pages/AllPendingOrders";
import AdminInventory from "./pages/AdminInventory";
import RelentlessInventory from "./pages/RelentlessInventory";
import { useEffect } from "react";
import { orderApi } from "./api/orderApi";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function ProtectedRoute({ children, showNav = true }: { children: React.ReactNode, showNav?: boolean }) {
  const { user } = useAuth();
  
  // Initialize the API when the app starts
  useEffect(() => {
    if (window) {
      window.orderApi = orderApi;
      console.log("Order API initialized and available via window.orderApi");
    }
  }, []);
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <>
      {showNav && <Navigation />}
      {children}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Login />} />
              
              {/* Dashboard as landing page after login (no navigation) */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute showNav={false}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/pending-orders"
                element={
                  <ProtectedRoute>
                    <PendingOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/all-pending-orders"
                element={
                  <ProtectedRoute>
                    <AllPendingOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/completed-orders"
                element={
                  <ProtectedRoute>
                    <CompletedOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mto-order"
                element={
                  <ProtectedRoute>
                    <MTOOrder />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cross-dock"
                element={
                  <ProtectedRoute>
                    <CrossDock />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin-inventory"
                element={
                  <ProtectedRoute>
                    <AdminInventory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/relentless-inventory"
                element={
                  <ProtectedRoute showNav={false}>
                    <RelentlessInventory />
                  </ProtectedRoute>
                }
              />
              
              {/* Redirect to dashboard if logged in */}
              <Route
                path="*"
                element={<Navigate to="/dashboard" replace />}
              />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
