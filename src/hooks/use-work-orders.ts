import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { WorkOrder } from "@/types/database";

export function useWorkOrders(maintenanceRequestId?: string) {
  const queryClient = useQueryClient();

  const workOrdersQuery = useQuery({
    queryKey: ['work-orders', maintenanceRequestId],
    queryFn: async () => {
      try {
        const query = supabase
          .from('work_orders')
          .select(`
            *,
            contractors (*),
            maintenance_request:maintenance_request_id (
              *,
              properties (*)
            )
          `);

        if (maintenanceRequestId) {
          query.eq('maintenance_request_id', maintenanceRequestId);
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }

        return data as WorkOrder[];
      } catch (error) {
        console.error('Error fetching work orders:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60, // Cache for 1 minute
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const createWorkOrder = useMutation({
    mutationFn: async (data: Partial<WorkOrder>) => {
      const { data: workOrder, error } = await supabase
        .from('work_orders')
        .insert([{
          ...data,
          status: 'pending',
          estimated_cost: data.estimated_cost ? parseFloat(data.estimated_cost as string) : null,
        }])
        .select(`
          *,
          contractors (*),
          maintenance_request:maintenance_request_id (
            *,
            properties (*)
          )
        `)
        .single();

      if (error) throw error;
      return workOrder;
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
        .update({
          ...updates,
          estimated_cost: updates.estimated_cost ? parseFloat(updates.estimated_cost as string) : null,
        })
        .eq('id', id)
        .select(`
          *,
          contractors (*),
          maintenance_request:maintenance_request_id (
            *,
            properties (*)
          )
        `)
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