import { useWorkOrders } from "@/hooks/use-work-orders";
import { WorkOrderCard } from "./WorkOrderCard";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorDisplay } from "@/components/ui/error-display";

interface WorkOrderListProps {
  maintenanceRequestId?: string;
  showWorkOrders?: boolean;
}

export function WorkOrderList({ maintenanceRequestId, showWorkOrders }: WorkOrderListProps) {
  const {
    workOrders,
    isLoading,
    error,
  } = useWorkOrders(maintenanceRequestId);

  if (isLoading) {
    return <LoadingState message="Loading work orders..." />;
  }

  if (error) {
    return (
      <ErrorDisplay 
        message="Failed to load work orders" 
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="space-y-4">
      {workOrders?.map((workOrder) => (
        <WorkOrderCard 
          key={workOrder.id} 
          workOrder={workOrder}
          showFullDetails={showWorkOrders}
        />
      ))}

      {(!workOrders || workOrders.length === 0) && (
        <div className="text-center py-8 text-muted-foreground">
          No work orders found.
        </div>
      )}
    </div>
  );
}