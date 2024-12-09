import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, CheckCircle } from "lucide-react";
import { EditWorkOrderDialog } from "./EditWorkOrderDialog";
import { DeleteWorkOrderDialog } from "./DeleteWorkOrderDialog";
import { useWorkOrders } from "@/hooks/use-work-orders";
import type { WorkOrder } from "@/types/database";

interface WorkOrderActionsProps {
  workOrder: WorkOrder;
}

export function WorkOrderActions({ workOrder }: WorkOrderActionsProps) {
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const { updateWorkOrder } = useWorkOrders();
  const { toast } = useToast();

  const handleComplete = async () => {
    try {
      await updateWorkOrder.mutateAsync({
        id: workOrder.id,
        status: 'completed'
      });
      
      toast({
        title: "Success",
        description: "Work order marked as completed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update work order",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowEdit(true)}
        className="bg-white/[0.03] backdrop-blur-xl border-white/[0.05]"
      >
        <Edit className="h-4 w-4" />
      </Button>

      {workOrder.status !== 'completed' && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleComplete}
          className="bg-white/[0.03] backdrop-blur-xl border-white/[0.05]"
        >
          <CheckCircle className="h-4 w-4" />
        </Button>
      )}

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowDelete(true)}
        className="bg-white/[0.03] backdrop-blur-xl border-white/[0.05]"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <EditWorkOrderDialog
        open={showEdit}
        onOpenChange={setShowEdit}
        workOrder={workOrder}
      />

      <DeleteWorkOrderDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        workOrderId={workOrder.id}
      />
    </div>
  );
}