import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MaintenanceRequestCard } from "./MaintenanceRequestCard";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorDisplay } from "@/components/ui/error-display";
import type { MaintenanceRequest } from "@/types/database";

export function MaintenanceRequestList() {
  const { data: requests, isLoading, error } = useQuery({
    queryKey: ["maintenance-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance_requests")
        .select(`
          *,
          properties (*),
          work_orders (*)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as MaintenanceRequest[];
    },
  });

  if (isLoading) {
    return <LoadingState message="Loading maintenance requests..." />;
  }

  if (error) {
    return <ErrorDisplay message="Failed to load maintenance requests" />;
  }

  return (
    <div className="space-y-4">
      {requests?.map((request) => (
        <MaintenanceRequestCard key={request.id} request={request} />
      ))}
      
      {!requests?.length && (
        <div className="text-center py-8 text-muted-foreground">
          No maintenance requests found.
        </div>
      )}
    </div>
  );
}