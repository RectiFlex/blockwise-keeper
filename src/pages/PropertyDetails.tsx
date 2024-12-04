import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Building2, 
  Calendar, 
  FileText, 
  Shield, 
  History, 
  User,
  Wrench,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";

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
        .eq('property_id', id)
        .order('end_date', { ascending: true });
      
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
        .eq('property_id', id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoadingProperty || isLoadingWarranties || isLoadingMaintenance) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const getWarrantyStatus = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const daysRemaining = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining < 0) return { status: 'expired', color: 'bg-red-500/10 text-red-500' };
    if (daysRemaining < 30) return { status: 'expiring soon', color: 'bg-yellow-500/10 text-yellow-500' };
    return { status: 'active', color: 'bg-green-500/10 text-green-500' };
  };

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
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Property Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Address:</strong> {property?.address}</p>
              <p><strong>Created:</strong> {new Date(property?.created_at).toLocaleDateString()}</p>
              {property?.smart_contract_address && (
                <div className="mt-4">
                  <p className="font-semibold mb-2">Smart Contract Address:</p>
                  <p className="font-mono text-sm break-all bg-primary/5 p-2 rounded">
                    {property.smart_contract_address}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Warranty Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {warranties?.length > 0 ? (
                warranties.map((warranty) => {
                  const { status, color } = getWarrantyStatus(warranty.end_date);
                  return (
                    <div key={warranty.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold">{warranty.title}</h4>
                        <Badge className={color}>{status}</Badge>
                      </div>
                      {warranty.description && (
                        <p className="text-sm text-muted-foreground">{warranty.description}</p>
                      )}
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>Start: {new Date(warranty.start_date).toLocaleDateString()}</span>
                        <span>End: {new Date(warranty.end_date).toLocaleDateString()}</span>
                      </div>
                      <Separator className="my-2" />
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6">
                  <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No warranties registered</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-full card-gradient">
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
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Date(request.created_at).toLocaleDateString()}
                      {request.work_orders?.[0] && (
                        <>
                          <Separator orientation="vertical" className="h-4" />
                          <Wrench className="h-4 w-4" />
                          Work Order: {request.work_orders[0].status}
                        </>
                      )}
                    </div>
                    <Separator className="my-2" />
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No maintenance history</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}