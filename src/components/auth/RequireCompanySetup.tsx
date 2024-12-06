import { Navigate, Outlet } from "react-router-dom";
import { LoadingSpinner } from "./LoadingSpinner";
import { useProfile } from "@/hooks/use-profile";
import CompanyOnboarding from "@/components/onboarding/CompanyOnboarding";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function RequireCompanySetup() {
  const { data: profile, isLoading, error } = useProfile();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = "/auth";
      }
    };
    
    checkAuth();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !profile) {
    return <Navigate to="/auth" replace />;
  }

  if (!profile.company_id) {
    return <CompanyOnboarding />;
  }

  return <Outlet />;
}