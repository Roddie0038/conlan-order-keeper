
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
import { DarkModeToggle } from "./components/DarkModeToggle";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

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
                  path="/dashboard"
                  element={
                    <ProtectedRoute showNav={false}>
                      <InventoryProvider>
                        <Dashboard />
                      </InventoryProvider>
                    </ProtectedRoute>
                  }
                />
                
                {/* Add placeholder routes for features to be implemented */}
                <Route
                  path="/pending-orders"
                  element={
                    <ProtectedRoute>
                      <div className="container mx-auto p-8">
                        <h1 className="text-3xl font-bold mb-8">Pending Orders Page</h1>
                        <p>This feature will be implemented in the next phase.</p>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/order-management"
                  element={
                    <ProtectedRoute>
                      <div className="container mx-auto p-8">
                        <h1 className="text-3xl font-bold mb-8">Order Management Page</h1>
                        <p>This feature will be implemented in the next phase.</p>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/mto-order"
                  element={
                    <ProtectedRoute>
                      <div className="container mx-auto p-8">
                        <h1 className="text-3xl font-bold mb-8">MTO Order Page</h1>
                        <p>This feature will be implemented in the next phase.</p>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cross-dock"
                  element={
                    <ProtectedRoute>
                      <div className="container mx-auto p-8">
                        <h1 className="text-3xl font-bold mb-8">Cross Dock Page</h1>
                        <p>This feature will be implemented in the next phase.</p>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/wheel-order"
                  element={
                    <ProtectedRoute>
                      <div className="container mx-auto p-8">
                        <h1 className="text-3xl font-bold mb-8">Wheel Order Page</h1>
                        <p>This feature will be implemented in the next phase.</p>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin-inventory"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <div className="container mx-auto p-8">
                        <h1 className="text-3xl font-bold mb-8">Admin Inventory Page</h1>
                        <p>This feature will be implemented in the next phase.</p>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin-orders"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <div className="container mx-auto p-8">
                        <h1 className="text-3xl font-bold mb-8">Admin Orders Page</h1>
                        <p>This feature will be implemented in the next phase.</p>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/all-orders"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <div className="container mx-auto p-8">
                        <h1 className="text-3xl font-bold mb-8">All Orders Page</h1>
                        <p>This feature will be implemented in the next phase.</p>
                      </div>
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
