import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { web3Service } from "@/services/web3Service";
import DashboardGrid from "@/components/dashboard/DashboardGrid";
import CompanyOnboarding from "@/components/onboarding/CompanyOnboarding";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const [showWidgetPicker, setShowWidgetPicker] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const { toast } = useToast();

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*, companies(*)')
        .eq('id', user.id)
        .single();
      
      return profile;
    }
  });

  const connectWallet = async () => {
    try {
      const address = await web3Service.connectWallet();
      setWalletAddress(address);
      toast({
        title: "Wallet Connected",
        description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
      });
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // If user doesn't have a company_id, show onboarding
  if (profile && !profile.company_id) {
    return <CompanyOnboarding />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowWidgetPicker(prev => !prev)}
            className="bg-white/[0.03] backdrop-blur-xl border-white/[0.05] ml-4"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Widget
          </Button>
        </div>
        {walletAddress ? (
          <Button 
            variant="outline" 
            className="flex gap-2 bg-white/[0.03] backdrop-blur-xl border-white/[0.05]"
          >
            <Wallet className="h-4 w-4" />
            {`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}
          </Button>
        ) : (
          <Button 
            onClick={connectWallet} 
            className="flex gap-2 bg-white/[0.03] backdrop-blur-xl border-white/[0.05]"
          >
            <Wallet className="h-4 w-4" />
            Connect Wallet
          </Button>
        )}
      </div>

      <DashboardGrid />
    </div>
  );
}