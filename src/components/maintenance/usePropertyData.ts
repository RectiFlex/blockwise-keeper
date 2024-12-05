import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function usePropertyData() {
  return useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('properties')
        .select('id, title, address')
        .eq('owner_id', user.id);
      
      if (error) {
        console.error('Error fetching properties:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        return [];
      }

      return data;
    },
  });
}