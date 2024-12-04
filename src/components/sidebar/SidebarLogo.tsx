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
          src="/lovable-uploads/7ff2f9bd-bf12-41c9-b41d-e0c6dfda0ae4.png" 
          alt="Fix" 
          className="h-8" 
        />
      ) : (
        <img 
          src="/lovable-uploads/787661a7-8b14-4770-a8e4-b70371bfb96d.png" 
          alt="Fix" 
          className="h-8" 
        />
      )}
    </div>
  );
}