import { Button } from "@/components/ui/button";
import { Pencil, Trash2, CheckCircle } from "lucide-react";
import type { WorkOrder } from "@/types/database";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface WorkOrderActionsProps {
  workOrder: WorkOrder;
  onEdit: () => void;
  onDelete: () => void;
  onComplete: () => void;
  isLoading?: boolean;
}

export function WorkOrderActions({
  workOrder,
  onEdit,
  onDelete,
  onComplete,
  isLoading
}: WorkOrderActionsProps) {
  return (
    <div className="flex flex-col gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            disabled={isLoading}
            className="bg-white/[0.03] backdrop-blur-xl border-white/[0.05]"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Edit work order</TooltipContent>
      </Tooltip>
      
      {workOrder.status !== 'completed' && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onComplete();
              }}
              disabled={isLoading}
              className="bg-white/[0.03] backdrop-blur-xl border-white/[0.05]"
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Mark as completed</TooltipContent>
        </Tooltip>
      )}
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            disabled={isLoading}
            className="bg-white/[0.03] backdrop-blur-xl border-white/[0.05]"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Delete work order</TooltipContent>
      </Tooltip>
    </div>
  );
}