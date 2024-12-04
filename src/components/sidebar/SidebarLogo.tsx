import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarLogoProps {
  isCollapsed: boolean;
}

export function SidebarLogo({ isCollapsed }: SidebarLogoProps) {
  return (
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
  );
}