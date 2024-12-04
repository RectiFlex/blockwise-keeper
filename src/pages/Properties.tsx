import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { CreatePropertyModal } from "@/components/properties/CreatePropertyModal";

export default function Properties() {
  const [open, setOpen] = useState(false);

  const { data: properties, isLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (propertiesError) throw propertiesError;

      // Fetch maintenance counts and expenses for each property
      const propertiesWithStats = await Promise.all(
        propertiesData.map(async (property) => {
          const { count: maintenanceCount } = await supabase
            .from('maintenance_requests')
            .select('*', { count: 'exact', head: true })
            .eq('property_id', property.id);

          const { data: workOrders } = await supabase
            .from('work_orders')
            .select('actual_cost')
            .eq('maintenance_request_id', property.id);

          const totalExpenses = workOrders?.reduce((sum, order) => 
            sum + (order.actual_cost || 0), 0) || 0;

          return {
            ...property,
            maintenanceCount: maintenanceCount || 0,
            totalExpenses,
          };
        })
      );

      return propertiesWithStats;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Properties</h1>
          <p className="text-muted-foreground mt-1">
            Manage your registered properties
          </p>
        </div>
        <Button onClick={() => setOpen(true)} className="bg-accent hover:bg-accent/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Property
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {properties?.map((property) => (
          <PropertyCard 
            key={property.id} 
            property={property}
            maintenanceCount={property.maintenanceCount}
            totalExpenses={property.totalExpenses}
          />
        ))}
      </div>

      <CreatePropertyModal open={open} onOpenChange={setOpen} />
    </div>
  );
}