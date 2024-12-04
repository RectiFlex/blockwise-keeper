import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clipboard, Calendar, Wrench, Brain } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-500';
      case 'in_progress':
        return 'bg-blue-500/10 text-blue-500';
      case 'cancelled':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-yellow-500/10 text-yellow-500';
    }
  };

  const handleConvertToWorkOrder = (requestId: string) => {
    convertToWorkOrder.mutate(requestId);
  };

  return (
    <>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests?.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">{request.title}</TableCell>
                <TableCell>{request.properties?.title}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(request.status || '')}>
                    {request.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{request.priority}</Badge>
                </TableCell>
                <TableCell>
                  {new Date(request.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Clipboard className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Calendar className="h-4 w-4" />
                    </Button>
                    {!request.work_orders?.length && request.status === 'pending' && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleConvertToWorkOrder(request.id)}
                          disabled={convertToWorkOrder.isPending}
                          title="Convert to Work Order"
                        >
                          <Wrench className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => analyzeRequest(request.id)}
                          disabled={isAnalyzing}
                          title="Analyze with AI"
                        >
                          <Brain className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedRequestId} onOpenChange={() => setSelectedRequestId(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>AI Analysis</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {isAnalyzing ? (
              <div className="flex items-center justify-center p-4">
                <span className="animate-pulse">Analyzing request...</span>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans">{aiAnalysis}</pre>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}