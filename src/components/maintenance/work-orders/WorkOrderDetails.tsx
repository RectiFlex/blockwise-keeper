import { Calendar, DollarSign, User } from "lucide-react";
import type { WorkOrder } from "@/types/database";

interface WorkOrderDetailsProps {
  workOrder: WorkOrder;
  showFullDetails?: boolean;
}

export function WorkOrderDetails({ workOrder, showFullDetails }: WorkOrderDetailsProps) {
  return (
    <div className="space-y-4">
      {workOrder.contractor && (
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>Contractor: {workOrder.contractor.name}</span>
        </div>
      )}

      <div className="flex gap-4 text-sm text-muted-foreground">
        {workOrder.scheduled_date && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              {new Date(workOrder.scheduled_date).toLocaleDateString()}
            </span>
          </div>
        )}

        {workOrder.estimated_cost && (
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span>${workOrder.estimated_cost.toFixed(2)}</span>
          </div>
        )}
      </div>

      {workOrder.notes && (
        <p className="text-sm text-muted-foreground">{workOrder.notes}</p>
      )}
    </div>
  );
}