import { WorkOrderStatus } from "./WorkOrderStatus";
import { Separator } from "@/components/ui/separator";
import { Calendar, DollarSign, User, FileText } from "lucide-react";
import type { WorkOrder, Contractor } from "@/types/database";

interface WorkOrderDetailsProps {
  workOrder: WorkOrder;
  contractor?: Contractor;
}

export function WorkOrderDetails({ workOrder, contractor }: WorkOrderDetailsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <WorkOrderStatus status={workOrder.status || 'pending'} />
        <h3 className="text-lg font-semibold">Work Order #{workOrder.id.slice(0, 8)}</h3>
      </div>

      <div className="space-y-4">
        {contractor && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Contractor:</span>
              <span>{contractor.name}</span>
            </div>
            {contractor.phone && (
              <div className="text-sm text-muted-foreground ml-6">
                Phone: {contractor.phone}
              </div>
            )}
          </div>
        )}

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workOrder.scheduled_date && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Scheduled:</span>
              <span>{new Date(workOrder.scheduled_date).toLocaleDateString()}</span>
            </div>
          )}

          {workOrder.estimated_cost && (
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Estimated Cost:</span>
              <span>${workOrder.estimated_cost.toFixed(2)}</span>
            </div>
          )}
        </div>

        {workOrder.notes && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Notes:</span>
            </div>
            <p className="text-sm text-muted-foreground ml-6">
              {workOrder.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}