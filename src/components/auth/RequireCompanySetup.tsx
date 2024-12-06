import { Navigate, Outlet } from "react-router-dom";
import { LoadingSpinner } from "./LoadingSpinner";
import { useProfile } from "@/hooks/use-profile";
import CompanyOnboarding from "@/components/onboarding/CompanyOnboarding";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export function RequireCompanySetup() {
  const { data: profile, isLoading, error } = useProfile();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          logger.error("Session check error:", { error: sessionError });
          await supabase.auth.signOut();
        }
        setHasSession(!!session);
      } catch (error) {
        logger.error("Auth check error:", { error });
      } finally {
        setIsCheckingAuth(false);
      }
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      logger.info("Auth state changed:", { event });
      setHasSession(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isCheckingAuth || isLoading) {
    return <LoadingSpinner />;
  }

  if (!hasSession || error || !profile) {
    logger.info("Redirecting to auth:", { hasSession, hasError: !!error, hasProfile: !!profile });
    return <Navigate to="/auth" replace />;
  }

  if (!profile.company_id) {
    return <CompanyOnboarding />;
  }

  return <Outlet />;
}