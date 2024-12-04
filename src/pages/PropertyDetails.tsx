import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Building2, Calendar, FileText, Shield, History } from "lucide-react";

export default function PropertyDetails() {
  const { id } = useParams();

  const { data: property, isLoading: isLoadingProperty } = useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: warranties, isLoading: isLoadingWarranties } = useQuery({
    queryKey: ['warranties', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warranties')
        .select('*')
        .eq('property_id', id);
      
      if (error) throw error;
      return data;
    },
  });

  const { data: maintenanceHistory, isLoading: isLoadingMaintenance } = useQuery({
    queryKey: ['maintenance-history', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select(`
          *,
          work_orders (*)
        `)
        .eq('property_id', id);
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoadingProperty || isLoadingWarranties || isLoadingMaintenance) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{property?.title}</h1>
        {property?.smart_contract_address && (
          <Badge variant="outline" className="px-4 py-1">
            Smart Contract Active
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Property Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Address:</strong> {property?.address}</p>
              <p><strong>Owner ID:</strong> {property?.owner_id}</p>
              <p><strong>Created:</strong> {new Date(property?.created_at).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Smart Contract Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {property?.smart_contract_address ? (
              <div className="space-y-2">
                <p><strong>Contract Address:</strong></p>
                <p className="font-mono text-sm break-all">
                  {property.smart_contract_address}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">No smart contract associated</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Warranties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {warranties?.length > 0 ? (
                warranties.map((warranty) => (
                  <div key={warranty.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold">{warranty.title}</h4>
                      <Badge>{warranty.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{warranty.description}</p>
                    <div className="flex gap-4 text-sm">
                      <span>Start: {new Date(warranty.start_date).toLocaleDateString()}</span>
                      <span>End: {new Date(warranty.end_date).toLocaleDateString()}</span>
                    </div>
                    <Separator className="my-2" />
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No warranties found</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Maintenance History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {maintenanceHistory?.length > 0 ? (
                maintenanceHistory.map((request) => (
                  <div key={request.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold">{request.title}</h4>
                      <Badge variant="outline">{request.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{request.description}</p>
                    <div className="text-sm">
                      <Calendar className="h-4 w-4 inline-block mr-1" />
                      {new Date(request.created_at).toLocaleDateString()}
                    </div>
                    <Separator className="my-2" />
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No maintenance history found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}