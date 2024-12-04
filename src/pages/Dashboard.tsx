import DashboardStats from "@/components/dashboard/DashboardStats";
import MaintenanceTrends from "@/components/dashboard/MaintenanceTrends";
import PropertyDistribution from "@/components/dashboard/PropertyDistribution";
import ExpenseCategories from "@/components/dashboard/ExpenseCategories";

export default function Dashboard() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your property management dashboard
        </p>
      </div>

      <DashboardStats />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MaintenanceTrends />
        <PropertyDistribution />
      </div>

      <ExpenseCategories />
    </div>
  );
}