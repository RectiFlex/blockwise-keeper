import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { WorkOrder } from "@/types/database";

export function useSingleWorkOrder(workOrderId: string | null) {
  return useQuery({
    queryKey: ['work-order', workOrderId],
    queryFn: async () => {
      if (!workOrderId) return null;
      
      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          *,
          contractors (*),
          maintenance_request:maintenance_request_id (*)
        `)
        .eq('id', workOrderId)
        .single();
      
      if (error) throw error;
      return data as WorkOrder;
    },
    enabled: !!workOrderId,
  });
}