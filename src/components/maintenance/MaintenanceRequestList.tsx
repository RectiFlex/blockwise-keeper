import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useState } from "react";
import { MaintenanceRequestTable } from "./MaintenanceRequestTable";
import { AIAnalysisDialog } from "./AIAnalysisDialog";
import { Database } from "@/integrations/supabase/types";

type MaintenanceRequest = Database["public"]["Tables"]["maintenance_requests"]["Row"] & {
  work_orders: Database["public"]["Tables"]["work_orders"]["Row"][] | null;
  properties: Database["public"]["Tables"]["properties"]["Row"];
};

interface MaintenanceRequestListProps {
  showWorkOrders?: boolean;
}

export default function MaintenanceRequestList({ showWorkOrders = false }: MaintenanceRequestListProps) {
  const queryClient = useQueryClient();
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { data: requests, isLoading } = useQuery({
    queryKey: ['maintenance-requests', { workOrders: showWorkOrders }],
    queryFn: async () => {
      let query = supabase
        .from('maintenance_requests')
        .select(`
          *,
          work_orders (*),
          properties (*)
        `)
        .order('created_at', { ascending: false });

      if (showWorkOrders) {
        query = query.not('work_orders', 'is', null);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as MaintenanceRequest[];
    },
  });

  const convertToWorkOrder = useMutation({
    mutationFn: async (requestId: string) => {
      const { data: workOrder, error: workOrderError } = await supabase
        .from('work_orders')
        .insert([
          {
            maintenance_request_id: requestId,
            status: 'pending',
          },
        ])
        .select()
        .single();

      if (workOrderError) throw workOrderError;

      const { error: requestError } = await supabase
        .from('maintenance_requests')
        .update({ status: 'in_progress' })
        .eq('id', requestId);

      if (requestError) throw requestError;

      return workOrder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
      toast({
        title: "Success",
        description: "Maintenance request converted to work order",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to convert request to work order",
        variant: "destructive",
      });
      console.error('Error converting to work order:', error);
    },
  });

  const analyzeRequest = async (requestId: string) => {
    setIsAnalyzing(true);
    setSelectedRequestId(requestId);
    try {
      const response = await fetch('/functions/v1/analyze-maintenance-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ requestId }),
      });

      const data = await response.json();
      setAiAnalysis(data.analysis);
    } catch (error) {
      console.error('Error analyzing request:', error);
      toast({
        title: "Error",
        description: "Failed to analyze maintenance request",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <MaintenanceRequestTable
        requests={requests}
        onConvertToWorkOrder={(requestId) => convertToWorkOrder.mutate(requestId)}
        onAnalyzeRequest={analyzeRequest}
        isConverting={convertToWorkOrder.isPending}
        isAnalyzing={isAnalyzing}
      />

      <AIAnalysisDialog
        isOpen={!!selectedRequestId}
        onOpenChange={() => setSelectedRequestId(null)}
        analysis={aiAnalysis}
        isAnalyzing={isAnalyzing}
      />
    </>
  );
}