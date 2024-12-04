import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { CreatePropertyModal } from "@/components/properties/CreatePropertyModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { LoadingState } from "@/components/ui/loading-state";

export default function Properties() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: properties, isLoading, error } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*, maintenance_requests(count)');
      
      if (error) throw error;
      return data;
    },
  });

  const { data: expenses } = useQuery({
    queryKey: ['property_expenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_orders')
        .select('property_id, actual_cost');
      
      if (error) throw error;
      
      // Calculate total expenses per property
      const expensesByProperty = data.reduce((acc: Record<string, number>, order) => {
        if (order.property_id && order.actual_cost) {
          acc[order.property_id] = (acc[order.property_id] || 0) + Number(order.actual_cost);
        }
        return acc;
      }, {});
      
      return expensesByProperty;
    },
  });

  if (error) {
    throw error; // This will be caught by the ErrorBoundary
  }

  if (isLoading) {
    return <LoadingState message="Loading properties..." />;
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Properties</h1>
            <p className="text-muted-foreground">
              Manage your property portfolio
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties?.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              maintenanceCount={property.maintenance_requests?.[0]?.count || 0}
              totalExpenses={expenses?.[property.id] || 0}
            />
          ))}
        </div>

        <CreatePropertyModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
        />
      </div>
    </ErrorBoundary>
  );
}