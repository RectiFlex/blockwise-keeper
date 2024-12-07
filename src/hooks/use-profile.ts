import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";

// Define types for better type safety
interface Profile {
  id: string;
  subscription_status: string;
  subscription_end_date: string | null;
  created_at: string;
  updated_at: string;
  company_id: string | null;
  role: string;
  company?: Company;
}

interface Company {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface SupabaseError {
  message: string;
  details: string | null;
  hint: string | null;
  code: string;
}

export function useProfile() {
  const { toast } = useToast();

  return useQuery<Profile>({
    queryKey: ["profile"],
    queryFn: async () => {
      try {
        // Check if the user has a valid session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session?.user) {
          if (sessionError) logger.error("Session error:", { error: sessionError });
          await supabase.auth.signOut();
          throw new Error("Session expired. Please log in again.");
        }

        const userId = session.user.id;
        logger.info("Fetching profile for user:", { userId });

        // Fetch the profile, including company details
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select(`
            id,
            subscription_status,
            subscription_end_date,
            created_at,
            updated_at,
            company_id,
            role,
            companies(id, name, created_at, updated_at)
          `)
          .eq("id", userId)
          .single();

        if (profileError) {
          logger.error("Profile fetch error:", { error: profileError });
          throw profileError;
        }

        logger.info("Profile data fetched successfully");
        return profile;
      } catch (err: unknown) {
        const error = err as SupabaseError; // Cast to SupabaseError type
        logger.error("Error in profile query:", { error });
        toast({
          title: "Error",
          description: error.message || "Failed to load profile data. Please refresh the page or try again later.",
          variant: "destructive",
        });
        throw error;
      }
    },
    retry: (failureCount, err: unknown) => {
      const error = err as SupabaseError; // Cast to SupabaseError type
      // Skip retries for authentication errors
      if (error?.code === "401" || error?.code === "403") return false;
      return failureCount < 1; // Retry once for other errors
    },
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    staleTime: 300000, // 5 minutes
  });
}
