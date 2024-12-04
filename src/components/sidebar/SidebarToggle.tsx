import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarToggleProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function SidebarToggle({ isCollapsed, onToggle }: SidebarToggleProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="absolute -right-4 top-8 h-8 w-8 rounded-full border border-white/10 bg-black/20 backdrop-blur-xl"
      onClick={onToggle}
    >
      <ChevronLeft className={cn(
        "h-4 w-4 transition-transform duration-200",
        isCollapsed && "rotate-180"
      )} />
    </Button>
  );
}