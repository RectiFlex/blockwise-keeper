import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarProfileProps {
  isCollapsed: boolean;
}

export function SidebarProfile({ isCollapsed }: SidebarProfileProps) {
  const [email, setEmail] = useState<string>("");
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>("free");
  const [isCollapsedState] = useLocalStorage("sidebar-collapsed", false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || "");
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_status')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setSubscriptionStatus(profile.subscription_status);
        }
      }
    }
    getUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
    navigate("/auth");
  };

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
      isCollapsedState ? "justify-center" : "border-t border-white/10"
    )}>
      {isCollapsedState ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Avatar>
              <AvatarFallback className="bg-blue-500/10 text-blue-500">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent side="right">
            <div className="text-sm">
              <p>{email}</p>
              <p className="text-xs text-muted-foreground">{subscriptionStatus} Plan</p>
            </div>
          </TooltipContent>
        </Tooltip>
      ) : (
        <>
          <Avatar>
            <AvatarFallback className="bg-blue-500/10 text-blue-500">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex flex-col">
              <span className="text-sm font-medium">{email}</span>
              <span className="text-xs text-gray-400 capitalize">{subscriptionStatus} Plan</span>
            </div>
            <button
              onClick={handleSignOut}
              className="mt-2 flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}