import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { HomeRedirect } from './HomeRedirect';

// Page imports
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import SignUp from '@/pages/SignUp';
import SignUpSuccess from '@/pages/SignUpSuccess';
import ResetPassword from '@/pages/ResetPassword';
import Dashboard from '@/pages/Dashboard';
import PendingOrders from '@/pages/PendingOrders';
import AllPendingOrders from '@/pages/AllPendingOrders';
import CompletedOrders from '@/pages/CompletedOrders';
import OrderManagement from '@/pages/OrderManagement';
import AdminInventory from '@/pages/AdminInventory';
import AdminOrders from '@/pages/AdminOrders';
import AllOrders from '@/pages/AllOrders';
import ApprovedTreads from '@/pages/ApprovedTreads';
import RelentlessInventory from '@/pages/RelentlessInventory';
import MTOOrder from '@/pages/MTOOrder';
import CrossDock from '@/pages/CrossDock';
import WheelOrder from '@/pages/WheelOrder';
import RetreadWarranty from '@/pages/RetreadWarranty';
import ComplaintTracking from '@/pages/ComplaintTracking';
import MyComplaints from '@/pages/MyComplaints';
import EmailTestingSuite from '@/pages/EmailTestingSuite';
import Settings from '@/pages/Settings';
import PlantSwitcherGuide from '@/pages/PlantSwitcherGuide';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/transfer-request" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/signup-success" element={<SignUpSuccess />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* Protected Routes */}
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
      <Route
        path="/settings"
        element={
          <RequireAuth>
            <Settings />
          </RequireAuth>
        }
      />
      <Route
        path="/plant-switcher-guide"
        element={
          <RequireAuth>
            <PlantSwitcherGuide />
          </RequireAuth>
        }
      />
    </Routes>
  );
}