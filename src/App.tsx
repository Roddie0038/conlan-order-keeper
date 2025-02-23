
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "./components/ui/toaster";
import Login from "./pages/Login";
import PendingOrders from "./pages/PendingOrders";
import CompletedOrders from "./pages/CompletedOrders";
import MTOOrder from "./pages/MTOOrder";
import AllPendingOrders from "./pages/AllPendingOrders";
import CrossDock from "./pages/CrossDock";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/pending-orders" element={<PendingOrders />} />
              <Route path="/completed-orders" element={<CompletedOrders />} />
              <Route path="/all-pending-orders" element={<AllPendingOrders />} />
              <Route path="/mto-order" element={<MTOOrder />} />
              <Route path="/cross-dock" element={<CrossDock />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
