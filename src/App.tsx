import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Navigation } from "./components/Navigation";
import Login from "./pages/Login";
import PendingOrders from "./pages/PendingOrders";
import CompletedOrders from "./pages/CompletedOrders";
import MTOOrder from "./pages/MTOOrder";
import CrossDockPaperwork from "./pages/CrossDockPaperwork";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return (
    <>
      <Navigation />
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
              <Route
                path="/pending-orders"
                element={
                  <ProtectedRoute>
                    <PendingOrders />
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
                    <CrossDockPaperwork />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;