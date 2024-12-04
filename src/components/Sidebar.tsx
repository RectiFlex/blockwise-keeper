import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  BarChart2,
  Building2,
  Settings,
  Wrench,
  Users,
  FileText,
  LayoutDashboard,
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Building2, label: "Properties", path: "/properties" },
  { icon: Wrench, label: "Maintenance", path: "/maintenance" },
  { icon: Users, label: "Contractors", path: "/contractors" },
  { icon: BarChart2, label: "Analytics", path: "/analytics" },
  { icon: FileText, label: "Reports", path: "/reports" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="h-screen w-64 bg-black/20 backdrop-blur-xl border-r border-white/10 p-4 flex flex-col">
      <div className="flex items-center gap-2 px-2 py-4">
        <Building2 className="h-8 w-8 text-blue-500" />
        <span className="text-xl font-bold">BlockFix</span>
      </div>
      
      <nav className="flex-1 mt-8">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                    "hover:bg-white/10",
                    isActive ? "bg-white/10 text-blue-400" : "text-gray-400"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}