import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Wrench, Clock } from "lucide-react";
import { AIAnalysisDialog } from "../ai/AIAnalysisDialog";
import { AISchedulingDialog } from "../ai/AISchedulingDialog";
import { CreateWorkOrderDialog } from "../work-orders/CreateWorkOrderDialog";
import type { MaintenanceRequest } from "@/types/database";

interface MaintenanceRequestActionsProps {
  request: MaintenanceRequest;
}

export function MaintenanceRequestActions({ request }: MaintenanceRequestActionsProps) {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showScheduling, setShowScheduling] = useState(false);
  const [showWorkOrder, setShowWorkOrder] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    try {
      const response = await supabase.functions.invoke('analyze-maintenance-request', {
        body: { requestId: request.id }
      });
      
      if (response.error) throw response.error;
      setShowAnalysis(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze request",
        variant: "destructive"
      });
    }
  };

  const handleScheduling = async () => {
    try {
      const response = await supabase.functions.invoke('analyze-scheduling', {
        body: { requestId: request.id }
      });
      
      if (response.error) throw response.error;
      setShowScheduling(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze scheduling",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowWorkOrder(true)}
        className="bg-white/[0.03] backdrop-blur-xl border-white/[0.05]"
      >
        <Wrench className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleAnalyze}
        className="bg-white/[0.03] backdrop-blur-xl border-white/[0.05]"
      >
        <Brain className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleScheduling}
        className="bg-white/[0.03] backdrop-blur-xl border-white/[0.05]"
      >
        <Clock className="h-4 w-4" />
      </Button>

      <AIAnalysisDialog
        open={showAnalysis}
        onOpenChange={setShowAnalysis}
        requestId={request.id}
      />

      <AISchedulingDialog
        open={showScheduling}
        onOpenChange={setShowScheduling}
        requestId={request.id}
      />

      <CreateWorkOrderDialog
        open={showWorkOrder}
        onOpenChange={setShowWorkOrder}
        request={request}
      />
    </div>
  );
}