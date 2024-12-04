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
      {isCollapsed ? (
        <img 
          src="/lovable-uploads/ffaebf99-5ca2-46e8-8ed1-dc3cfff04627.png" 
          alt="BlockFix" 
          className="h-8" 
        />
      ) : (
        <img 
          src="/lovable-uploads/ffaebf99-5ca2-46e8-8ed1-dc3cfff04627.png" 
          alt="BlockFix" 
          className="h-8" 
        />
      )}
    </div>
  );
}