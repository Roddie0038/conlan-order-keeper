
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./components/theme-provider";
import { Navigation } from "./components/Navigation";
import Login from "./pages/Login";
import PendingOrders from "./pages/PendingOrders";
import CompletedOrders from "./pages/CompletedOrders";
import MTOOrder from "./pages/MTOOrder";
import CrossDock from "./pages/CrossDock";
import AllPendingOrders from "./pages/AllPendingOrders";

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
      <ThemeProvider defaultTheme="light" storageKey="conlan-tire-theme">
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
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
