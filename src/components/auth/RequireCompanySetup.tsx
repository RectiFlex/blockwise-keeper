import { Navigate, Outlet } from "react-router-dom";
import { LoadingSpinner } from "./LoadingSpinner";
import { useProfile } from "@/hooks/use-profile";
import CompanyOnboarding from "@/components/onboarding/CompanyOnboarding";

export function RequireCompanySetup() {
  const { data: profile, isLoading, error } = useProfile();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <Navigate to="/auth" replace />;
  }

  if (!profile?.company_id) {
    return <CompanyOnboarding />;
  }

  return <Outlet />;
}