import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface WorkOrderStatusProps {
  status: string;
  className?: string;
}

export function WorkOrderStatus({ status, className }: WorkOrderStatusProps) {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
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
    <Badge 
      variant="outline" 
      className={cn(getStatusColor(status), className)}
    >
      {status?.replace('_', ' ')}
    </Badge>
  );
}