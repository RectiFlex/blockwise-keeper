import { useState, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { CreatePropertyModal } from "@/components/properties/CreatePropertyModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { LoadingState } from "@/components/ui/loading-state";
import type { Database } from "@/integrations/supabase/types";

type Property = Database['public']['Tables']['properties']['Row'] & {
  maintenance_requests: { count: number }[];
};

type DemoProperty = Database['public']['Tables']['demo_properties']['Row'];

const PropertiesList = () => {
  const { data: userSettings } = useQuery({
    queryKey: ['userSettings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
  });

  const { data: properties } = useQuery({
    queryKey: ['properties', { demo: userSettings?.demo_mode }],
    queryFn: async () => {
      if (userSettings?.demo_mode) {
        const { data, error } = await supabase
          .from('demo_properties')
          .select('*');
        
        if (error) throw error;
        return data as DemoProperty[];
      }

      const { data, error } = await supabase
        .from('properties')
        .select('*, maintenance_requests(count)');
      
      if (error) throw error;
      return data as Property[];
    },
    enabled: !!userSettings,
  });

  const { data: expenses } = useQuery({
    queryKey: ['property_expenses', { demo: userSettings?.demo_mode }],
    queryFn: async () => {
      if (userSettings?.demo_mode) {
        // Return mock expenses for demo properties
        return properties?.reduce((acc: Record<string, number>, property) => {
          acc[property.id] = Math.floor(Math.random() * 10000);
          return acc;
        }, {});
      }

      const { data, error } = await supabase
        .from('maintenance_requests')
        .select(`
          property_id,
          work_orders(actual_cost)
        `);
      
      if (error) throw error;
      
      const expensesByProperty = (data || []).reduce((acc: Record<string, number>, request) => {
        if (!request.property_id) return acc;
        
        const costs = request.work_orders?.reduce((sum: number, order) => {
          return sum + (order.actual_cost || 0);
        }, 0) || 0;
        
        acc[request.property_id] = (acc[request.property_id] || 0) + costs;
        return acc;
      }, {});
      
      return expensesByProperty;
    },
    enabled: !!properties,
  });

  if (!properties) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          maintenanceCount={userSettings?.demo_mode ? Math.floor(Math.random() * 10) : (property as Property).maintenance_requests?.[0]?.count || 0}
          totalExpenses={expenses?.[property.id] || 0}
        />
      ))}
    </div>
  );
};

export default function Properties() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { data: userSettings } = useQuery({
    queryKey: ['userSettings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
  });

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Properties</h1>
            <p className="text-muted-foreground">
              {userSettings?.demo_mode ? "Demo Mode: Viewing sample properties" : "Manage your property portfolio"}
            </p>
          </div>
          {!userSettings?.demo_mode && (
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Property
            </Button>
          )}
        </div>

        <Suspense fallback={<LoadingState message="Loading properties..." />}>
          <PropertiesList />
        </Suspense>

        <CreatePropertyModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
        />
      </div>
    </ErrorBoundary>
  );
}