import { Toaster } from "@/components/ui/toaster";
import Sidebar from "./Sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex w-full">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
      <Toaster />
    </div>
  );
}