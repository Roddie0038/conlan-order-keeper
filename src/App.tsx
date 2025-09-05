import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { AuthHealthMonitor } from './components/auth/AuthHealthMonitor';
import { PlantProvider } from './contexts/PlantContext';
import { LiveEditProvider } from './contexts/LiveEditContext';
import { Toaster } from "@/components/ui/toaster"
import { ConditionalSidebar } from './components/ConditionalSidebar';
import { AppRoutes } from './components/routing/AppRoutes';
import { LiveEditToggle } from './components/live-edit/LiveEditToggle';
import { StyleEditor } from './components/live-edit/StyleEditor';
import { useRegistrationNotification } from './hooks/useRegistrationNotification';

// Create a client
const queryClient = new QueryClient();

function AppContent() {
  // Set up registration notification listener
  useRegistrationNotification();
  
  return (
    <>
      <AuthHealthMonitor />
      <LiveEditToggle />
      <StyleEditor />
      <ConditionalSidebar>
        <AppRoutes />
      </ConditionalSidebar>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <PlantProvider>
          <LiveEditProvider>
            <QueryClientProvider client={queryClient}>
              <Toaster />
              <AppContent />
            </QueryClientProvider>
          </LiveEditProvider>
        </PlantProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;