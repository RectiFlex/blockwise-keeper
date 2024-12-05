import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clipboard, Calendar, Wrench, Brain } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type MaintenanceRequest = Database["public"]["Tables"]["maintenance_requests"]["Row"] & {
  work_orders: Database["public"]["Tables"]["work_orders"]["Row"][] | null;
  properties: Database["public"]["Tables"]["properties"]["Row"];
};

interface MaintenanceRequestTableProps {
  requests: MaintenanceRequest[] | undefined;
  onConvertToWorkOrder: (requestId: string) => void;
  onAnalyzeRequest: (requestId: string) => void;
  isConverting: boolean;
  isAnalyzing: boolean;
}

export function MaintenanceRequestTable({
  requests,
  onConvertToWorkOrder,
  onAnalyzeRequest,
  isConverting,
  isAnalyzing,
}: MaintenanceRequestTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-500';
      case 'in_progress':
        return 'bg-blue-500/10 text-blue-500';
      case 'cancelled':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-yellow-500/10 text-yellow-500';
    }
  };

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Property</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests?.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-medium">{request.title}</TableCell>
              <TableCell>{request.properties?.title}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(request.status || '')}>
                  {request.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{request.priority}</Badge>
              </TableCell>
              <TableCell>
                {new Date(request.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Clipboard className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Calendar className="h-4 w-4" />
                  </Button>
                  {!request.work_orders?.length && request.status === 'pending' && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onConvertToWorkOrder(request.id)}
                        disabled={isConverting}
                        title="Convert to Work Order"
                      >
                        <Wrench className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onAnalyzeRequest(request.id)}
                        disabled={isAnalyzing}
                        title="Analyze with AI"
                      >
                        <Brain className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}