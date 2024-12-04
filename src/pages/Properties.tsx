import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";

type Property = Tables<"properties">;

export default function Properties() {
  const { data: properties, isLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
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
        <h1 className="text-3xl font-bold">Properties</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Property
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties?.map((property) => (
          <Link key={property.id} to={`/properties/${property.id}`}>
            <Card className="hover:shadow-lg transition-shadow card-gradient">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {property.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{property.address}</p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Added {new Date(property.created_at).toLocaleDateString()}
                  </span>
                  {property.smart_contract_address && (
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                      Smart Contract
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {properties?.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No properties yet</h3>
            <p className="text-sm text-muted-foreground">
              Add your first property to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}