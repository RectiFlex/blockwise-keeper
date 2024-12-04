import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Loader2 } from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// Chart configurations
const chartConfig = {
  status: {
    label: "Status",
    theme: {
      light: "#0088FE",
      dark: "#0088FE"
    }
  },
  priority: {
    label: "Priority",
    theme: {
      light: "#00C49F",
      dark: "#00C49F"
    }
  },
  cost: {
    label: "Cost",
    theme: {
      light: "#FFBB28",
      dark: "#FFBB28"
    }
  }
};

export default function Reports() {
  const [activeTab, setActiveTab] = useState("maintenance");

  // Fetch maintenance requests data
  const { data: maintenanceData, isLoading: maintenanceLoading } = useQuery({
    queryKey: ["maintenance-reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance_requests")
        .select(`
          *,
          work_orders (
            estimated_cost,
            actual_cost,
            status
          )
        `);
      if (error) throw error;
      return data;
    },
  });

  // Fetch properties data
  const { data: propertiesData, isLoading: propertiesLoading } = useQuery({
    queryKey: ["properties-reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select(`
          *,
          maintenance_requests (count),
          warranties (count)
        `);
      if (error) throw error;
      return data;
    },
  });

  // Calculate maintenance statistics
  const maintenanceStats = maintenanceData?.reduce((acc: any, request: any) => {
    acc.total++;
    acc.byStatus[request.status] = (acc.byStatus[request.status] || 0) + 1;
    acc.byPriority[request.priority] = (acc.byPriority[request.priority] || 0) + 1;
    
    const workOrder = request.work_orders?.[0];
    if (workOrder?.actual_cost) {
      acc.totalCost += parseFloat(workOrder.actual_cost);
    }
    return acc;
  }, { total: 0, byStatus: {}, byPriority: {}, totalCost: 0 });

  // Format data for charts
  const statusData = maintenanceStats?.byStatus 
    ? Object.entries(maintenanceStats.byStatus).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  const priorityData = maintenanceStats?.byPriority
    ? Object.entries(maintenanceStats.byPriority).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  if (maintenanceLoading || propertiesLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reports</h1>
      </div>

      <Tabs defaultValue="maintenance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
        </TabsList>

        <TabsContent value="maintenance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {maintenanceStats?.total || 0}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {maintenanceStats?.byStatus?.pending || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  High Priority
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {maintenanceStats?.byPriority?.high || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Cost
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${maintenanceStats?.totalCost.toFixed(2) || "0.00"}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer className="h-[300px]" config={chartConfig}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Priority Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer className="h-[300px]" config={chartConfig}>
                  <BarChart data={priorityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Bar dataKey="value" fill="#8884d8" />
                    <ChartTooltip />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Overview</CardTitle>
              <CardDescription>
                Monthly maintenance costs and projections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer className="h-[300px]" config={chartConfig}>
                <LineChart data={maintenanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="created_at" />
                  <YAxis />
                  <Line 
                    type="monotone" 
                    dataKey="work_orders.actual_cost" 
                    stroke="#8884d8" 
                  />
                  <ChartTooltip />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="properties" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {propertiesData?.map((property: any) => (
              <Card key={property.id}>
                <CardHeader>
                  <CardTitle>{property.title}</CardTitle>
                  <CardDescription>{property.address}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Maintenance Requests:</span>
                      <span>{property.maintenance_requests_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Warranties:</span>
                      <span>{property.warranties_count}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}