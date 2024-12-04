import { Building2, Wrench, Shield, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";

// Sample data for charts
const maintenanceData = [
  { month: "Jan", requests: 12 },
  { month: "Feb", requests: 19 },
  { month: "Mar", requests: 15 },
  { month: "Apr", requests: 22 },
  { month: "May", requests: 18 },
  { month: "Jun", requests: 25 },
];

const propertyDistribution = [
  { type: "Residential", value: 45 },
  { type: "Commercial", value: 30 },
  { type: "Industrial", value: 25 },
];

const expenseData = [
  { category: "Repairs", amount: 12000 },
  { category: "Utilities", amount: 8000 },
  { category: "Insurance", amount: 6000 },
  { category: "Taxes", amount: 9000 },
];

const COLORS = ['#8B5CF6', '#D946EF', '#F97316', '#0EA5E9'];

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
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={maintenanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.2)' 
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="requests" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  dot={{ fill: '#8B5CF6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="glass card-gradient p-6">
          <h2 className="text-lg font-semibold mb-4">Property Distribution</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={propertyDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {propertyDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.2)' 
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass card-gradient p-6">
        <h2 className="text-lg font-semibold mb-4">Expenses by Category</h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={expenseData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="category" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(0,0,0,0.8)', 
                  border: '1px solid rgba(255,255,255,0.2)' 
                }}
              />
              <Bar dataKey="amount">
                {expenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}