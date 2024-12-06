import { Navigate, Outlet } from "react-router-dom";
import { LoadingSpinner } from "./LoadingSpinner";
import { useProfile } from "@/hooks/use-profile";
import CompanyOnboarding from "@/components/onboarding/CompanyOnboarding";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function RequireCompanySetup() {
  const { data: profile, isLoading, error } = useProfile();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setHasSession(!!session);
      setIsCheckingAuth(false);
    };
    
    checkAuth();
  }, []);

  if (isCheckingAuth || isLoading) {
    return <LoadingSpinner />;
  }

  if (!hasSession || error || !profile) {
    return <Navigate to="/auth" replace />;
  }

  if (!profile.company_id) {
    return <CompanyOnboarding />;
  }

  return <Outlet />;
}