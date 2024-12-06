import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Outlet, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/ui/error-boundary";
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
      gcTime: 3600000, // Keep unused data in cache for 1 hour
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
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
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
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;