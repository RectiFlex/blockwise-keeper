import { Toaster } from "@/components/ui/toaster";
import Sidebar from "./Sidebar";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/hooks/use-local-storage";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isCollapsed] = useLocalStorage("sidebar-collapsed", false);

  return (
    <div className="min-h-screen flex w-full bg-background">
      <Sidebar />
      <main 
        className={cn(
          "flex-1 p-8 transition-all duration-300 ml-28",
          isCollapsed ? "md:ml-28" : "md:ml-72"
        )}
      >
        {children}
      </main>
      <Toaster />
    </div>
  );
}