
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Index from './pages/Index';
import Login from './pages/Login';
import OrderForm from './components/order-form';
import PendingOrders from './pages/PendingOrders';
import MTOOrder from './pages/MTOOrder';
import Dashboard from './pages/Dashboard';
import CompletedOrders from './pages/CompletedOrders';
import CrossDock from './pages/CrossDock';
import WheelOrder from './pages/WheelOrder';
import OrderManagement from './pages/OrderManagement';
import StagingDashboard from './pages/StagingDashboard';
import { useAuth } from './contexts/AuthContext';
import { PlantProvider } from './contexts/PlantContext';
import { Toaster } from '@/components/ui/toaster';
import { isStaging } from './config/environment';
import { EnvironmentIndicator } from './components/environment/EnvironmentIndicator';
import { StagingNav } from './components/environment/StagingNav';

function App() {
  const { user } = useAuth();

  return (
    <PlantProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/order-form" element={<OrderForm />} />
          <Route path="/pending-orders" element={<PendingOrders />} />
          <Route path="/mto-order" element={<MTOOrder />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/completed-orders" element={<CompletedOrders />} />
          <Route path="/cross-dock" element={<CrossDock />} />
          <Route path="/wheel-order" element={<WheelOrder />} />
          <Route path="/order-management" element={<OrderManagement />} />
          
          {/* Staging Dashboard - only accessible in staging environment */}
          {isStaging && <Route path="/staging" element={<StagingDashboard />} />}
          
          {/* Catch all redirect */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <StagingNav />
      </Router>
      <Toaster />
      <EnvironmentIndicator />
    </PlantProvider>
  );
}

export default App;
