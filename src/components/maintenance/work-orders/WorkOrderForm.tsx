import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useWorkOrders } from "@/hooks/use-work-orders";
import { useContractors } from "@/hooks/use-contractors";
import { LoadingState } from "@/components/ui/loading-state";
import { workOrderSchema, type WorkOrderFormData } from "./WorkOrderSchema";
import { WorkOrderFormFields } from "./WorkOrderFormFields";
import type { WorkOrder } from "@/types/database";

interface WorkOrderFormProps {
  maintenanceRequestId?: string;
  workOrder?: WorkOrder;
  onSuccess: () => void;
}

export function WorkOrderForm({ maintenanceRequestId, workOrder, onSuccess }: WorkOrderFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createWorkOrder, updateWorkOrder } = useWorkOrders();
  const { data: contractors, isLoading } = useContractors();
  const { toast } = useToast();

  const form = useForm<WorkOrderFormData>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: workOrder ? {
      contractor_id: workOrder.contractor_id || "",
      estimated_cost: workOrder.estimated_cost?.toString() || "",
      scheduled_date: workOrder.scheduled_date || "",
      notes: workOrder.notes || "",
    } : {
      contractor_id: "",
      estimated_cost: "",
      scheduled_date: "",
      notes: "",
    },
  });

  const onSubmit = async (data: WorkOrderFormData) => {
    if (!maintenanceRequestId && !workOrder) {
      toast({
        title: "Error",
        description: "Missing maintenance request ID",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (workOrder) {
        await updateWorkOrder.mutateAsync({
          id: workOrder.id,
          ...data,
        });
      } else {
        await createWorkOrder.mutateAsync({
          maintenance_request_id: maintenanceRequestId!,
          ...data,
        });
      }
      
      toast({
        title: "Success",
        description: `Work order ${workOrder ? 'updated' : 'created'} successfully`,
      });
      onSuccess();
    } catch (error) {
      console.error('Work order error:', error);
      toast({
        title: "Error",
        description: `Failed to ${workOrder ? 'update' : 'create'} work order`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading contractors..." />;
  }

  if (!contractors?.length) {
    return (
      <div className="text-center p-4">
        <p className="text-muted-foreground">No contractors available. Please add contractors first.</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <WorkOrderFormFields form={form} contractors={contractors} />
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Saving..." : workOrder ? "Update Work Order" : "Create Work Order"}
        </Button>
      </form>
    </Form>
  );
}