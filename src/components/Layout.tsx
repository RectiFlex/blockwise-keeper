import { Toaster } from "@/components/ui/toaster";
import Sidebar from "./Sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex w-full">
      <Sidebar />
      <main className="flex-1 overflow-auto transition-all duration-300">
        <div className="container py-8">{children}</div>
      </main>
      <Toaster />
    </div>
  );
}