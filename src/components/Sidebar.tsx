import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Building2,
  Settings,
  Wrench,
  Users,
  FileText,
  LayoutDashboard,
  ChevronLeft,
  Brain,
} from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Building2, label: "Properties", path: "/properties" },
  { icon: Wrench, label: "Maintenance", path: "/maintenance" },
  { icon: Users, label: "Contractors", path: "/contractors" },
  { icon: FileText, label: "Reports", path: "/reports" },
  { icon: Brain, label: "AI Assistant", path: "/ai" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export default function Sidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div 
      className={cn(
        "relative h-[calc(100vh-2rem)] m-4 glass rounded-2xl flex flex-col transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className={cn(
        "flex items-center gap-2 px-4 py-6",
        isCollapsed && "justify-center"
      )}>
        <Building2 className="h-8 w-8 text-blue-500 shrink-0" />
        <span className={cn(
          "text-xl font-bold transition-opacity duration-200",
          isCollapsed && "opacity-0 w-0"
        )}>BlockFix</span>
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-8 h-8 w-8 rounded-full border border-white/10 bg-black/20 backdrop-blur-xl"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <ChevronLeft className={cn(
          "h-4 w-4 transition-transform duration-200",
          isCollapsed && "rotate-180"
        )} />
      </Button>
      
      <nav className="flex-1 px-2">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                {isCollapsed ? (
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Link
                        to={item.path}
                        className={cn(
                          "flex items-center justify-center p-2 rounded-lg transition-colors",
                          "hover:bg-white/10",
                          isActive ? "bg-white/10 text-blue-400" : "text-gray-400"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="border-white/10 bg-black/50 backdrop-blur-xl">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                ) : (
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
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}