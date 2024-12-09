import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MaintenanceRequestList } from "./requests/MaintenanceRequestList";
import { WorkOrderList } from "./work-orders/WorkOrderList";

export function MaintenanceContent() {
  const [activeTab, setActiveTab] = useState("requests");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList>
        <TabsTrigger value="requests">Maintenance Requests</TabsTrigger>
        <TabsTrigger value="work-orders">Work Orders</TabsTrigger>
      </TabsList>
      <TabsContent value="requests">
        <MaintenanceRequestList />
      </TabsContent>
      <TabsContent value="work-orders">
        <WorkOrderList showWorkOrders={true} />
      </TabsContent>
    </Tabs>
  );
}