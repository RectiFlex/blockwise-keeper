import { Building2, Wrench, Shield, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  {
    icon: Building2,
    label: "Properties",
    value: "24",
    change: "+8%",
    changeType: "positive",
    description: "Total registered properties",
  },
  {
    icon: Wrench,
    label: "Maintenance",
    value: "8",
    change: "-12%",
    changeType: "negative",
    description: "Active work orders",
  },
  {
    icon: Shield,
    label: "Warranties",
    value: "16",
    change: "+5%",
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

export default function Dashboard() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to BlockFix property management system
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass card-gradient p-6">
          <h2 className="text-lg font-semibold mb-4">Maintenance Trends</h2>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Chart will be implemented in next iteration
          </div>
        </div>
        
        <div className="glass card-gradient p-6">
          <h2 className="text-lg font-semibold mb-4">Property Distribution</h2>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Chart will be implemented in next iteration
          </div>
        </div>
      </div>
    </div>
  );
}