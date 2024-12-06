import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useProfile() {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session fetch error:", sessionError);
          throw sessionError;
        }
        
        if (!session?.user) {
          console.log("No authenticated user found");
          return null;
        }

        const userId = session.user.id;
        console.log("Fetching profile for user:", userId);
        
        // First fetch the profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, subscription_status, subscription_end_date, created_at, updated_at, company_id, role')
          .eq('id', userId)
          .single();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          throw profileError;
        }

        // If there's a company_id, fetch the company details separately
        if (profileData.company_id) {
          const { data: companyData, error: companyError } = await supabase
            .from('companies')
            .select('*')
            .eq('id', profileData.company_id)
            .single();

          if (companyError) {
            console.error("Company fetch error:", companyError);
            throw companyError;
          }

          // Combine the data
          return {
            ...profileData,
            companies: companyData
          };
        }

        console.log("Profile data fetched successfully:", profileData);
        return profileData;
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
    retry: 1,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    staleTime: 300000, // 5 minutes
  });
}