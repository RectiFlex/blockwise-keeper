import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardGrid from "@/components/dashboard/DashboardGrid";
import CompanyOnboarding from "@/components/onboarding/CompanyOnboarding";

export default function Dashboard() {
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*, companies(*)')
        .eq('id', user.id)
        .single();
      
      return profile;
    }
  });

  // If user doesn't have a company_id, show onboarding
  if (profile && !profile.company_id) {
    return <CompanyOnboarding />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <DashboardGrid />
    </div>
  );
}