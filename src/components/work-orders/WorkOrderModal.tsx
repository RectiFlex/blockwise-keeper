import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { WorkOrderForm } from "./WorkOrderForm";
import type { WorkOrderFormValues } from "./workOrderSchema";
import { LoadingState } from "@/components/ui/loading-state";
import { useContractors } from "@/hooks/use-contractors";
import { useSingleWorkOrder } from "@/hooks/use-single-work-order";

interface WorkOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maintenanceRequestId: string;
  workOrderId?: string | null;
  onSubmit: (data: WorkOrderFormValues) => Promise<void>;
}

export function WorkOrderModal({
  open,
  onOpenChange,
  maintenanceRequestId,
  workOrderId,
  onSubmit,
}: WorkOrderModalProps) {
  const { data: contractors, isLoading: loadingContractors } = useContractors();
  const { data: workOrder, isLoading: loadingWorkOrder } = useSingleWorkOrder(workOrderId);

  const isLoading = loadingContractors || (workOrderId && loadingWorkOrder);

  if (!open) return null;

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <LoadingState message="Loading..." />
        </DialogContent>
      </Dialog>
    );
  }

  if (!contractors) {
    return null;
  }

  const defaultValues: WorkOrderFormValues = {
    contractor_id: workOrder?.contractor_id || "",
    estimated_cost: workOrder?.estimated_cost?.toString() || "",
    scheduled_date: workOrder?.scheduled_date || "",
    notes: workOrder?.notes || "",
    status: workOrder?.status || "pending",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {workOrderId ? 'Edit Work Order' : 'Create Work Order'}
          </DialogTitle>
          <DialogDescription>
            {workOrderId 
              ? 'Update the work order details below.'
              : 'Fill in the details to create a new work order.'}
          </DialogDescription>
        </DialogHeader>
        <WorkOrderForm
          contractors={contractors}
          defaultValues={defaultValues}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}