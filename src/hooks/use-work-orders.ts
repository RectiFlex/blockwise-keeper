import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { WorkOrder } from "@/types/database";

export function useWorkOrders(maintenanceRequestId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const workOrdersQuery = useQuery({
    queryKey: ['work-orders', maintenanceRequestId],
    queryFn: async () => {
      const query = supabase
        .from('work_orders')
        .select(`
          *,
          contractors (*)
        `);

      if (maintenanceRequestId) {
        query.eq('maintenance_request_id', maintenanceRequestId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data as WorkOrder[];
    },
    enabled: !!maintenanceRequestId,
  });

  const createWorkOrder = useMutation({
    mutationFn: async (workOrder: Partial<WorkOrder>) => {
      const { data, error } = await supabase
        .from('work_orders')
        .insert([{
          ...workOrder,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
    },
  });

  const updateWorkOrder = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<WorkOrder> & { id: string }) => {
      const { data, error } = await supabase
        .from('work_orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
    },
  });

  const deleteWorkOrder = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('work_orders')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
    },
  });

  return {
    workOrders: workOrdersQuery.data || [],
    isLoading: workOrdersQuery.isLoading,
    error: workOrdersQuery.error,
    createWorkOrder,
    updateWorkOrder,
    deleteWorkOrder,
  };
}