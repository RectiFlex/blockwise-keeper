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
import { useWorkOrders } from "@/hooks/use-work-orders";
import { useToast } from "@/hooks/use-toast";

interface DeleteWorkOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workOrderId: string;
}

export function DeleteWorkOrderDialog({ 
  open, 
  onOpenChange, 
  workOrderId 
}: DeleteWorkOrderDialogProps) {
  const { deleteWorkOrder } = useWorkOrders();
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      await deleteWorkOrder.mutateAsync(workOrderId);
      toast({
        title: "Success",
        description: "Work order deleted successfully",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete work order",
        variant: "destructive",
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
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
  );
}