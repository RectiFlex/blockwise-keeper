import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Building2,
  Settings,
  Wrench,
  Users,
  FileText,
  LayoutDashboard,
  Brain,
  Award,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "./ui/tooltip";
import { SidebarLogo } from "./sidebar/SidebarLogo";
import { SidebarToggle } from "./sidebar/SidebarToggle";
import { SidebarProfile } from "./sidebar/SidebarProfile";
import { supabase } from "@/integrations/supabase/client";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Building2, label: "Properties", path: "/properties" },
  { icon: Wrench, label: "Maintenance", path: "/maintenance" },
  { icon: Users, label: "Contractors", path: "/contractors" },
  { icon: FileText, label: "Reports", path: "/reports" },
];

const bottomMenuItems = [
  { icon: Brain, label: "AI Assistant", path: "/ai" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export default function Sidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMvp, setIsMvp] = useState(false);

  useEffect(() => {
    const checkSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_status')
          .eq('id', user.id)
          .single();
        
        setIsMvp(profile?.subscription_status === 'mvp');
      }
    };

    checkSubscription();
  }, []);

  return (
    <TooltipProvider>
      <div 
        className={cn(
          "relative h-[calc(100vh-2rem)] m-4 glass rounded-2xl flex flex-col transition-all duration-300",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="flex items-center justify-between p-4">
          <SidebarLogo isCollapsed={isCollapsed} />
          {isMvp && (
            <div className={cn(
              "flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500",
              isCollapsed && "hidden"
            )}>
              <Award className="h-4 w-4" />
              <span className="text-sm font-medium">MVP</span>
            </div>
          )}
        </div>

        <SidebarToggle 
          isCollapsed={isCollapsed} 
          onToggle={() => setIsCollapsed(!isCollapsed)} 
        />
        
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

        <div className="mt-auto px-2 pb-4">
          <ul className="space-y-2">
            {bottomMenuItems.map((item) => {
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
        </div>

        <SidebarProfile isCollapsed={isCollapsed} />
      </div>
    </TooltipProvider>
  );
}