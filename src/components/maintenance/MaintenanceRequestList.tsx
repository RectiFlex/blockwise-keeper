import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useState } from "react";
import { MaintenanceRequestTable } from "./MaintenanceRequestTable";
import { AIAnalysisDialog } from "./AIAnalysisDialog";
import { AISchedulingDialog } from "./AISchedulingDialog";
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
  const [schedulingAnalysis, setSchedulingAnalysis] = useState<string | null>(null);
  const [isAnalyzingSchedule, setIsAnalyzingSchedule] = useState(false);

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
      const response = await supabase.functions.invoke('analyze-maintenance-request', {
        body: { requestId },
      });
      if (response.error) throw response.error;
      setAiAnalysis(response.data.analysis);
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

  const analyzeScheduling = async (requestId: string) => {
    setIsAnalyzingSchedule(true);
    setSelectedRequestId(requestId);
    try {
      const response = await supabase.functions.invoke('analyze-scheduling', {
        body: { requestId },
      });
      if (response.error) throw response.error;
      setSchedulingAnalysis(response.data.analysis);
    } catch (error) {
      console.error('Error analyzing scheduling:', error);
      toast({
        title: "Error",
        description: "Failed to analyze scheduling options",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzingSchedule(false);
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
        onAnalyzeScheduling={analyzeScheduling}
        isConverting={convertToWorkOrder.isPending}
        isAnalyzing={isAnalyzing}
        isAnalyzingSchedule={isAnalyzingSchedule}
      />

      <AIAnalysisDialog
        isOpen={!!selectedRequestId && !!aiAnalysis}
        onOpenChange={() => setSelectedRequestId(null)}
        analysis={aiAnalysis}
        isAnalyzing={isAnalyzing}
      />

      <AISchedulingDialog
        isOpen={!!selectedRequestId && !!schedulingAnalysis}
        onOpenChange={() => setSelectedRequestId(null)}
        analysis={schedulingAnalysis}
        isAnalyzing={isAnalyzingSchedule}
      />
    </>
  );
}