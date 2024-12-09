import { useWorkOrders } from "@/hooks/use-work-orders";
import { WorkOrderDetails } from "./WorkOrderDetails";
import { WorkOrderActions } from "./WorkOrderActions";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { WorkOrderModal } from "./WorkOrderModal";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorDisplay } from "@/components/ui/error-display";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";

interface WorkOrderListProps {
  maintenanceRequestId: string;
}

export function WorkOrderList({ maintenanceRequestId }: WorkOrderListProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<string | null>(null);
  const [workOrderToDelete, setWorkOrderToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  
  const {
    workOrders,
    isLoading,
    error,
    createWorkOrder,
    updateWorkOrder,
    deleteWorkOrder
  } = useWorkOrders(maintenanceRequestId);

  const handleDelete = async () => {
    if (!workOrderToDelete) return;
    
    try {
      await deleteWorkOrder.mutateAsync(workOrderToDelete);
      setWorkOrderToDelete(null);
      toast({
        title: "Success",
        description: "Work order deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete work order",
        variant: "destructive",
      });
    }
  };

  const handleComplete = async (workOrderId: string) => {
    try {
      await updateWorkOrder.mutateAsync({
        id: workOrderId,
        status: 'completed'
      });
      toast({
        title: "Success",
        description: "Work order marked as completed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update work order status",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading work orders..." />;
  }

  if (error) {
    return <ErrorDisplay message="Failed to load work orders" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Work Orders</h3>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="bg-white/[0.03] backdrop-blur-xl border-white/[0.05]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Work Order
        </Button>
      </div>

      <div className="space-y-4">
        {workOrders.map((workOrder) => (
          <Card key={workOrder.id} className="glass card-gradient">
            <div className="flex justify-between items-start p-6">
              <div className="flex-1">
                <WorkOrderDetails 
                  workOrder={workOrder}
                  contractor={workOrder.contractor}
                />
              </div>
              <div className="ml-4">
                <WorkOrderActions
                  workOrder={workOrder}
                  onEdit={() => setSelectedWorkOrder(workOrder.id)}
                  onDelete={() => setWorkOrderToDelete(workOrder.id)}
                  onComplete={() => handleComplete(workOrder.id)}
                  isLoading={updateWorkOrder.isPending || deleteWorkOrder.isPending}
                />
              </div>
            </div>
          </Card>
        ))}

        {workOrders.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No work orders found. Create one to get started.
          </div>
        )}
      </div>

      <WorkOrderModal
        open={showCreateModal || !!selectedWorkOrder}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateModal(false);
            setSelectedWorkOrder(null);
          }
        }}
        maintenanceRequestId={maintenanceRequestId}
        workOrderId={selectedWorkOrder}
        onSubmit={async (data) => {
          if (selectedWorkOrder) {
            await updateWorkOrder.mutateAsync({
              id: selectedWorkOrder,
              ...data,
            });
          } else {
            await createWorkOrder.mutateAsync({
              maintenance_request_id: maintenanceRequestId,
              ...data,
            });
          }
          setShowCreateModal(false);
          setSelectedWorkOrder(null);
        }}
      />

      <AlertDialog open={!!workOrderToDelete} onOpenChange={() => setWorkOrderToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Work Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this work order? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}