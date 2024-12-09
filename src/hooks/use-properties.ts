import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Property } from "@/types/database";

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

      return data as Property[];
    },
  });
}

export function useProperties() {
  const propertiesQuery = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*, maintenance_requests(count)');
      
      if (error) throw error;
      return data as Property[];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const expensesQuery = useQuery({
    queryKey: ['property_expenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select(`
          property_id,
          work_orders(actual_cost)
        `);
      
      if (error) throw error;
      
      const expensesByProperty = (data || []).reduce((acc: Record<string, number>, request) => {
        if (!request.property_id) return acc;
        
        const costs = request.work_orders?.reduce((sum: number, order) => {
          return sum + (order.actual_cost || 0);
        }, 0) || 0;
        
        acc[request.property_id] = (acc[request.property_id] || 0) + costs;
        return acc;
      }, {});
      
      return expensesByProperty;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return {
    properties: propertiesQuery.data,
    expenses: expensesQuery.data,
    isLoading: propertiesQuery.isLoading || expensesQuery.isLoading,
    error: propertiesQuery.error || expensesQuery.error,
  };
}