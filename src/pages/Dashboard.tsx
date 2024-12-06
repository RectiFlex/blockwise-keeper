import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { web3Service } from "@/services/web3Service";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import DashboardStats from "@/components/dashboard/DashboardStats";
import MaintenanceTrends from "@/components/dashboard/MaintenanceTrends";
import PropertyDistribution from "@/components/dashboard/PropertyDistribution";
import ExpenseCategories from "@/components/dashboard/ExpenseCategories";
import CompanyOnboarding from "@/components/onboarding/CompanyOnboarding";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your property management dashboard
          </p>
        </div>
        <div>
          {walletAddress ? (
            <Button variant="outline" className="flex gap-2">
              <Wallet className="h-4 w-4" />
              {`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}
            </Button>
          ) : (
            <Button onClick={connectWallet} className="flex gap-2">
              <Wallet className="h-4 w-4" />
              Connect Wallet
            </Button>
          )}
        </div>
      </div>

      <DashboardStats />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MaintenanceTrends />
        <PropertyDistribution />
      </div>

      <ExpenseCategories />
    </div>
  );
}