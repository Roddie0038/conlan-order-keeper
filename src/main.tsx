
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { Toaster } from './components/ui/toaster'
import { TooltipProvider } from './components/ui/tooltip'
import Login from './pages/Login'
import PendingOrders from './pages/PendingOrders'
import Dashboard from './pages/Dashboard'
import Index from './pages/Index'
import MTOOrder from './pages/MTOOrder'
import CompletedOrders from './pages/CompletedOrders'
import CrossDock from './pages/CrossDock'
import RelentlessInventory from './pages/RelentlessInventory'
import AllPendingOrders from './pages/AllPendingOrders'
import AdminInventory from './pages/AdminInventory'
import AdminOrders from './pages/AdminOrders'
import OrderManagement from './pages/OrderManagement'
import WheelOrder from './pages/WheelOrder'
import TestWebhooks from './pages/TestWebhooks'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<App />}>
              <Route index element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/pending-orders" element={<PendingOrders />} />
              <Route path="/mto-order" element={<MTOOrder />} />
              <Route path="/completed-orders" element={<CompletedOrders />} />
              <Route path="/cross-dock" element={<CrossDock />} />
              <Route path="/relentless-inventory" element={<RelentlessInventory />} />
              <Route path="/all-pending-orders" element={<AllPendingOrders />} />
              <Route path="/admin/inventory" element={<AdminInventory />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/order-management" element={<OrderManagement />} />
              <Route path="/wheel-order" element={<WheelOrder />} />
              <Route path="/test-webhooks" element={<TestWebhooks />} />
            </Route>
          </Routes>
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </React.StrictMode>,
)
