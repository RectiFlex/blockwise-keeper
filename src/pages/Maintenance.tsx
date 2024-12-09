import { useState } from "react";
import { MaintenanceHeader } from "@/components/maintenance/MaintenanceHeader";
import { MaintenanceContent } from "@/components/maintenance/MaintenanceContent";
import { CreateRequestDialog } from "@/components/maintenance/CreateRequestDialog";

export default function Maintenance() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <MaintenanceHeader onCreateRequest={() => setIsCreateDialogOpen(true)} />
      <MaintenanceContent />
      
      <CreateRequestDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
}