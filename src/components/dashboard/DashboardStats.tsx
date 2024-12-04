import { Building2, Wrench, Shield, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const fetchStats = async () => {
  const [propertyStats, maintenanceStats, warrantyStats] = await Promise.all([
    supabase.from('property_statistics').select('*').single(),
    supabase.from('maintenance_statistics').select('*').single(),
    supabase.from('warranty_statistics').select('*').single(),
  ]);

  return {
    properties: propertyStats.data,
    maintenance: maintenanceStats.data,
    warranty: warrantyStats.data,
  };
};

export default function DashboardStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchStats,
  });

  if (isLoading) {
    return <div>Loading stats...</div>;
  }

  const statCards = [
    {
      icon: Building2,
      label: "Properties",
      value: stats?.properties?.total_properties || "0",
      change: `${((stats?.properties?.new_properties_last_month || 0) / (stats?.properties?.total_properties || 1) * 100).toFixed(0)}%`,
      changeType: "positive",
      description: "Total registered properties",
    },
    {
      icon: Wrench,
      label: "Maintenance",
      value: stats?.maintenance?.pending_requests || "0",
      change: `${((stats?.maintenance?.requests_last_month || 0) / (stats?.maintenance?.total_requests || 1) * 100).toFixed(0)}%`,
      changeType: stats?.maintenance?.requests_last_month > stats?.maintenance?.total_requests / 12 ? "negative" : "positive",
      description: "Active work orders",
    },
    {
      icon: Shield,
      label: "Warranties",
      value: stats?.warranty?.active_warranties || "0",
      change: `${((stats?.warranty?.active_warranties || 0) / (stats?.warranty?.total_warranties || 1) * 100).toFixed(0)}%`,
      changeType: "positive",
      description: "Active warranties",
    },
    {
      icon: AlertTriangle,
      label: "Compliance",
      value: "98%",
      change: "+2%",
      changeType: "positive",
      description: "Overall compliance rate",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="glass card-gradient p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <Icon className="h-5 w-5 text-blue-400" />
              <span
                className={cn(
                  "text-sm",
                  stat.changeType === "positive"
                    ? "text-green-400"
                    : "text-red-400"
                )}
              >
                {stat.change}
              </span>
            </div>
            <div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">
                {stat.description}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}