import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { PlantProvider } from './contexts/PlantContext';
import { Toaster } from "@/components/ui/toaster"
import { ConditionalSidebar } from './components/ConditionalSidebar';
import { AppRoutes } from './components/routing/AppRoutes';
import { useRegistrationNotification } from './hooks/useRegistrationNotification';

// Create a client
const queryClient = new QueryClient();

function AppContent() {
  // Set up registration notification listener
  useRegistrationNotification();
  
  return (
    <ConditionalSidebar>
      <AppRoutes />
    </ConditionalSidebar>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <PlantProvider>
          <QueryClientProvider client={queryClient}>
            <Toaster />
            <AppContent />
          </QueryClientProvider>
        </PlantProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;