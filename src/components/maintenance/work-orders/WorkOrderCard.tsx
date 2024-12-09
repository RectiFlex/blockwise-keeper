import { Card } from "@/components/ui/card";
import { WorkOrderStatus } from "./WorkOrderStatus";
import { WorkOrderDetails } from "./WorkOrderDetails";
import { WorkOrderActions } from "./WorkOrderActions";
import type { WorkOrder } from "@/types/database";

interface WorkOrderCardProps {
  workOrder: WorkOrder;
  showFullDetails?: boolean;
}

export function WorkOrderCard({ workOrder, showFullDetails }: WorkOrderCardProps) {
  return (
    <Card className="p-6 glass card-gradient">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold">
                Work Order #{workOrder.id.slice(0, 8)}
              </h3>
              {showFullDetails && workOrder.maintenance_request && (
                <p className="text-sm text-muted-foreground">
                  {workOrder.maintenance_request.title}
                </p>
              )}
            </div>
            <WorkOrderStatus status={workOrder.status || 'pending'} />
          </div>
          
          <WorkOrderDetails 
            workOrder={workOrder} 
            showFullDetails={showFullDetails}
          />
        </div>
        
        <div className="ml-4">
          <WorkOrderActions workOrder={workOrder} />
        </div>
      </div>
    </Card>
  );
}