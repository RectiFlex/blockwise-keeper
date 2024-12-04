import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";

interface SidebarProfileProps {
  isCollapsed: boolean;
}

export function SidebarProfile({ isCollapsed }: SidebarProfileProps) {
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || "");
      }
    }
    getUser();
  }, []);

  if (!email) return null;

  const initials = email
    .split("@")[0]
    .split(".")
    .map(part => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className={cn(
      "flex items-center gap-3 p-4",
      isCollapsed ? "justify-center" : "border-t border-white/10"
    )}>
      <Avatar>
        <AvatarFallback className="bg-blue-500/10 text-blue-500">
          {isCollapsed ? <User className="h-4 w-4" /> : initials}
        </AvatarFallback>
      </Avatar>
      {!isCollapsed && (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{email}</span>
          <span className="text-xs text-gray-400">Manage Account</span>
        </div>
      )}
    </div>
  );
}