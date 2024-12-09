import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Contractor } from "@/types/database";

export function useContractors() {
  return useQuery({
    queryKey: ['contractors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contractors')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Contractor[];
    },
  });
}