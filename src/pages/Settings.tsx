import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CompanySettings from "@/components/settings/CompanySettings";
import UserSettings from "@/components/settings/UserSettings";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { loadStripe } from "@stripe/stripe-js";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("company");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      return profile;
    }
  });

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { user_id: user.id }
      });

      if (error) throw error;
      if (!data.sessionId) throw new Error('No session ID returned');

      const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
      if (!stripe) throw new Error('Stripe failed to load');

      await stripe.redirectToCheckout({ sessionId: data.sessionId });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>
      
      <div className="p-6 border rounded-lg bg-card">
        <h2 className="text-xl font-semibold mb-4">Subscription Status</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Current Plan</p>
              <p className="text-sm text-muted-foreground capitalize">
                {profile?.subscription_status || 'free'}
              </p>
            </div>
            {profile?.subscription_status === 'free' && (
              <Button
                onClick={handleSubscribe}
                disabled={isLoading}
              >
                Upgrade to MVP
              </Button>
            )}
          </div>
          {profile?.subscription_end_date && (
            <p className="text-sm text-muted-foreground">
              Subscription ends: {new Date(profile.subscription_end_date).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="user">User Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-6">
          <CompanySettings />
        </TabsContent>

        <TabsContent value="user" className="space-y-6">
          <UserSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}