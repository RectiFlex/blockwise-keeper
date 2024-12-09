import type { MaintenanceRequest } from "@/types/database";

interface MaintenanceRequestDetailsProps {
  request: MaintenanceRequest;
}

export function MaintenanceRequestDetails({ request }: MaintenanceRequestDetailsProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm">{request.description}</p>
      <div className="flex gap-4 text-sm text-muted-foreground">
        <span>Priority: {request.priority}</span>
        <span>Created: {new Date(request.created_at).toLocaleDateString()}</span>
      </div>
    </div>
  );
}