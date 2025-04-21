
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { PlantProvider } from "./contexts/PlantContext";
import { InventoryProvider } from "./contexts/InventoryContext";
import { Navigation } from "./components/Navigation";
import { LogoutButton } from "./components/LogoutButton";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PendingOrders from "./pages/PendingOrders";
import MTOOrder from "./pages/MTOOrder";
import CrossDock from "./pages/CrossDock";
import AdminInventory from "./pages/AdminInventory";
import AdminOrders from "./pages/AdminOrders";
import WheelOrder from "./pages/WheelOrder";
import OrderManagement from "./pages/OrderManagement";
import Index from "./pages/Index";
import WebhookTesting from "./pages/WebhookTesting";  // Add this import
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

function ProtectedRoute({ children, showNav = true, adminOnly = false }: { children: React.ReactNode, showNav?: boolean, adminOnly?: boolean }) {
  const { user } = useAuth();
  
  useEffect(() => {
    if (window) {
      window.orderApi = orderApi;
      console.log("Order API initialized and available via window.orderApi");
    }
  }, []);
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  if (adminOnly && !user.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <>
      {showNav && <Navigation />}
      <LogoutButton />
      {children}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PlantProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Login />} />
                
                <Route
                  path="/index"
                  element={
                    <ProtectedRoute>
                      <InventoryProvider>
                        <Index />
                      </InventoryProvider>
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute showNav={false}>
                      <InventoryProvider>
                        <Dashboard />
                      </InventoryProvider>
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/pending-orders"
                  element={
                    <ProtectedRoute>
                      <InventoryProvider>
                        <PendingOrders />
                      </InventoryProvider>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/order-management"
                  element={
                    <ProtectedRoute>
                      <OrderManagement />
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
                  path="/wheel-order"
                  element={
                    <ProtectedRoute showNav={false}>
                      <WheelOrder />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin-inventory"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <AdminInventory />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin-orders"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <InventoryProvider>
                        <AdminOrders />
                      </InventoryProvider>
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/webhook-testing"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <WebhookTesting />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="*"
                  element={<Navigate to="/dashboard" replace />}
                />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </PlantProvider>
    </QueryClientProvider>
  );
}

export default App;
