import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface MaintenanceHeaderProps {
  onCreateRequest: () => void;
}

export function MaintenanceHeader({ onCreateRequest }: MaintenanceHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold">Maintenance</h1>
      <Button 
        onClick={onCreateRequest}
        className="bg-white/[0.03] backdrop-blur-xl border-white/[0.05]"
      >
        <Plus className="h-4 w-4 mr-2" />
        New Request
      </Button>
    </div>
  );
}