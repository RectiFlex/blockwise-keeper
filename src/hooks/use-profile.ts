import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useProfile() {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error("User fetch error:", userError);
          throw userError;
        }
        
        if (!user) {
          console.log("No user found");
          return null;
        }

        console.log("Fetching profile for user:", user.id);
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*, companies(*)')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          throw profileError;
        }

        console.log("Profile data fetched:", profileData);
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