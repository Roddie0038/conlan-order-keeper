import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { HomeRedirect } from '@/components/routing/HomeRedirect';

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
import UserManagement from '@/pages/UserManagement';
import AdminEmailRouting from '@/pages/AdminEmailRouting';
import { RegionalMessagesPage } from '@/components/regional-messages/RegionalMessagesPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      
      <Route path="/new-order" element={
        <AuthGuard>
          <Index />
        </AuthGuard>
      } />
      
      <Route path="/transfer-request" element={
        <AuthGuard>
          <Index />
        </AuthGuard>
      } />
      
      <Route path="/login" element={
        <AuthGuard requireAuth={false}>
          <Login />
        </AuthGuard>
      } />
      
      <Route path="/signup" element={
        <AuthGuard requireAuth={false}>
          <SignUp />
        </AuthGuard>
      } />
      
      <Route path="/signup-success" element={
        <AuthGuard requireAuth={false}>
          <SignUpSuccess />
        </AuthGuard>
      } />
      
      <Route path="/reset-password" element={
        <AuthGuard requireAuth={false}>
          <ResetPassword />
        </AuthGuard>
      } />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <AuthGuard>
          <Dashboard />
        </AuthGuard>
      } />
      
      <Route path="/pending-orders" element={
        <AuthGuard>
          <PendingOrders />
        </AuthGuard>
      } />
      
      <Route path="/all-pending-orders" element={
        <AuthGuard>
          <AllPendingOrders />
        </AuthGuard>
      } />
      
      <Route path="/completed-orders" element={
        <AuthGuard>
          <CompletedOrders />
        </AuthGuard>
      } />
      
      <Route path="/order-management" element={
        <AuthGuard>
          <OrderManagement />
        </AuthGuard>
      } />
      
      <Route path="/admin-inventory" element={
        <AuthGuard>
          <AdminInventory />
        </AuthGuard>
      } />
      
      <Route path="/admin-orders" element={
        <AuthGuard>
          <AdminOrders />
        </AuthGuard>
      } />
      
      <Route path="/all-orders" element={
        <AuthGuard>
          <AllOrders />
        </AuthGuard>
      } />
      
      <Route path="/approved-treads" element={
        <AuthGuard>
          <ApprovedTreads />
        </AuthGuard>
      } />
      
      <Route path="/relentless-inventory" element={
        <AuthGuard>
          <RelentlessInventory />
        </AuthGuard>
      } />
      
      <Route path="/mto-order" element={
        <AuthGuard>
          <MTOOrder />
        </AuthGuard>
      } />
      
      <Route path="/cross-dock" element={
        <AuthGuard>
          <CrossDock />
        </AuthGuard>
      } />
      
      <Route path="/wheel-order" element={
        <AuthGuard>
          <WheelOrder />
        </AuthGuard>
      } />
      
      <Route path="/retread-warranty" element={
        <AuthGuard>
          <RetreadWarranty />
        </AuthGuard>
      } />
      
      <Route path="/complaint-tracking" element={
        <AuthGuard>
          <ComplaintTracking />
        </AuthGuard>
      } />
      
      <Route path="/my-complaints" element={
        <AuthGuard>
          <MyComplaints />
        </AuthGuard>
      } />
      
      <Route path="/email-testing" element={
        <AuthGuard>
          <EmailTestingSuite />
        </AuthGuard>
      } />
      
      <Route path="/settings" element={
        <AuthGuard>
          <Settings />
        </AuthGuard>
      } />
      
      <Route path="/plant-switcher-guide" element={
        <AuthGuard>
          <PlantSwitcherGuide />
        </AuthGuard>
      } />
      
      <Route path="/user-management" element={
        <AuthGuard>
          <UserManagement />
        </AuthGuard>
      } />
      
      <Route path="/admin/email-routing" element={
        <AuthGuard>
          <AdminEmailRouting />
        </AuthGuard>
      } />
      
      <Route path="/regional-messages" element={
        <AuthGuard>
          <RegionalMessagesPage />
        </AuthGuard>
      } />
    </Routes>
  );
}