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
      <img 
        src="/lovable-uploads/1db623eb-cd03-4145-83e9-884752c42d4b.png" 
        alt="BlockFix" 
        className="h-8" 
      />
    </div>
  );
}