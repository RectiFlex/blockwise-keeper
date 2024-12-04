import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { CreatePropertyModal } from "@/components/properties/CreatePropertyModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { LoadingState } from "@/components/ui/loading-state";

// Define types for better type safety
type Property = Database['public']['Tables']['properties']['Row'] & {
  maintenance_requests: { count: number }[];
};

type PropertyExpense = {
  maintenance_request: {
    property_id: string;
    work_orders: { actual_cost: number | null }[];
  };
};

const PropertiesList = () => {
  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*, maintenance_requests(count)');
      
      if (error) throw error;
      return data as Property[];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const { data: expenses } = useQuery({
    queryKey: ['property_expenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select(`
          property_id,
          work_orders(actual_cost)
        `);
      
      if (error) throw error;
      
      // Calculate total expenses per property
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
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  if (!properties) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          maintenanceCount={property.maintenance_requests?.[0]?.count || 0}
          totalExpenses={expenses?.[property.id] || 0}
        />
      ))}
    </div>
  );
};

export default function Properties() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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