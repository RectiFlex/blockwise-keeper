import { Card } from "@/components/ui/card";
import { WorkOrderStatus } from "../work-orders/WorkOrderStatus";
import { MaintenanceRequestDetails } from "./MaintenanceRequestDetails";
import { MaintenanceRequestActions } from "./MaintenanceRequestActions";
import type { MaintenanceRequest } from "@/types/database";

interface MaintenanceRequestCardProps {
  request: MaintenanceRequest;
}

export function MaintenanceRequestCard({ request }: MaintenanceRequestCardProps) {
  return (
    <Card className="p-6 glass card-gradient">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold">{request.title}</h3>
              <p className="text-sm text-muted-foreground">
                {request.property?.title}
              </p>
            </div>
            <WorkOrderStatus status={request.status || 'pending'} />
          </div>
          
          <MaintenanceRequestDetails request={request} />
        </div>
        
        <div className="ml-4">
          <MaintenanceRequestActions request={request} />
        </div>
      </div>
    </Card>
  );
}