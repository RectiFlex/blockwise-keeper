import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Outlet, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider, QueryErrorResetBoundary } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/lib/errorBoundary";
import { LoadingFallback } from "@/components/ui/loading-fallback";
import { ErrorDisplay } from "@/components/ui/error-display";
import { analytics } from "@/lib/analytics";
import Layout from "@/components/Layout";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Properties from "@/pages/Properties";
import PropertyDetails from "@/pages/PropertyDetails";
import Maintenance from "@/pages/Maintenance";
import Contractors from "@/pages/Contractors";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import AI from "@/pages/AI";
import { RequireCompanySetup } from "@/components/auth/RequireCompanySetup";

// Configure the QueryClient with proper settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 30000, // Cache data for 30 seconds
      gcTime: 3600000, // Keep unused data in cache for 1 hour,
      refetchOnMount: true
    },
  },
});

function PageViewTracker() {
  const location = useLocation();

  useEffect(() => {
    analytics.pageView(location.pathname);
  }, [location]);

  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary onReset={reset}>
          <Router>
            <PageViewTracker />
            <Routes>
              <Route path="/" element={<Navigate to="/auth" replace />} />
              <Route path="/auth" element={<Auth />} />
              <Route element={<RequireCompanySetup />}>
                <Route element={<Layout><Outlet /></Layout>}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/properties" element={<Properties />} />
                  <Route path="/properties/:id" element={<PropertyDetails />} />
                  <Route path="/maintenance" element={<Maintenance />} />
                  <Route path="/contractors" element={<Contractors />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/ai" element={<AI />} />
                </Route>
              </Route>
              <Route path="*" element={<Navigate to="/auth" replace />} />
            </Routes>
            <Toaster />
          </Router>
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
    </QueryClientProvider>
  );
}

export default App;