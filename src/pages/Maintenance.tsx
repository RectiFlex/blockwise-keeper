import { useState } from "react";
import { Button } from "@/components/ui/button";
import MaintenanceRequestForm from "@/components/maintenance/MaintenanceRequestForm";
import MaintenanceRequestList from "@/components/maintenance/MaintenanceRequestList";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Maintenance() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Maintenance</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>New Request</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Maintenance Request</DialogTitle>
            </DialogHeader>
            <MaintenanceRequestForm
              onSuccess={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="requests" className="w-full">
        <TabsList>
          <TabsTrigger value="requests">Maintenance Requests</TabsTrigger>
          <TabsTrigger value="work-orders">Work Orders</TabsTrigger>
        </TabsList>
        <TabsContent value="requests">
          <MaintenanceRequestList />
        </TabsContent>
        <TabsContent value="work-orders">
          <MaintenanceRequestList showWorkOrders={true} />
        </TabsContent>
      </Tabs>
    </div>
  );
}