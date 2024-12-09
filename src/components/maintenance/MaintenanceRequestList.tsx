import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { WorkOrderList } from "@/components/work-orders/WorkOrderList";
import { Card } from "@/components/ui/card";
import { WorkOrderStatus } from "@/components/work-orders/WorkOrderStatus";

export default function MaintenanceRequestList() {
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
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
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {requests?.map((request) => (
        <Card key={request.id} className="p-6 glass card-gradient">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{request.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {request.properties?.title}
                </p>
              </div>
              <WorkOrderStatus status={request.status || 'pending'} />
            </div>

            <p className="text-sm">{request.description}</p>

            <div className="pt-4">
              <WorkOrderList maintenanceRequestId={request.id} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}