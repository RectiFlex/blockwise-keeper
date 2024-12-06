import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Outlet, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { analytics } from "@/lib/analytics";
import { useToast } from "@/hooks/use-toast";
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
import CompanyOnboarding from "@/components/onboarding/CompanyOnboarding";
import { supabase } from "@/integrations/supabase/client";
import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5000,
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

function RequireCompanySetup() {
  const { toast } = useToast();
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) {
          console.error("User fetch error:", userError);
          throw userError;
        }
        if (!user) {
          console.log("No user found in RequireCompanySetup");
          return null;
        }
        
        console.log("Fetching profile for user:", user.id);
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', user.id)
          .maybeSingle();
        
        if (profileError) {
          console.error("Profile fetch error:", profileError);
          throw profileError;
        }

        console.log("Profile fetched:", data);
        return data;
      } catch (error: any) {
        console.error("Error in profile query:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try refreshing the page.",
          variant: "destructive",
        });
        throw error;
      }
    },
    retry: 2,
  });

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  if (error) {
    return <Navigate to="/auth" replace />;
  }

  if (!profile?.company_id) {
    return <CompanyOnboarding />;
  }

  return <Outlet />;
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