import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";

export function useProfile() {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      try {
        // First check if we have a valid session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          logger.error("Session error:", { error: sessionError });
          // Sign out if session is invalid
          await supabase.auth.signOut();
          throw sessionError;
        }
        
        if (!session?.user) {
          logger.info("No authenticated user found");
          return null;
        }

        const userId = session.user.id;
        logger.info("Fetching profile for user:", { userId });
        
        // Fetch profile with a simpler query first
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, subscription_status, subscription_end_date, created_at, updated_at, company_id, role')
          .eq('id', userId)
          .single();

        if (profileError) {
          logger.error("Profile fetch error:", { error: profileError });
          throw profileError;
        }

        // If profile has company_id, fetch company details in a separate query
        if (profile?.company_id) {
          const { data: company, error: companyError } = await supabase
            .from('companies')
            .select('*')
            .eq('id', profile.company_id)
            .single();

          if (companyError) {
            logger.error("Company fetch error:", { error: companyError });
            throw companyError;
          }

          return {
            ...profile,
            company
          };
        }

        logger.info("Profile data fetched successfully");
        return profile;
      } catch (error: any) {
        logger.error("Error in profile query:", { error });
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