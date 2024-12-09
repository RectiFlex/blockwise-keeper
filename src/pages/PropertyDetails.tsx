import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Calendar, 
  History, 
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Plus,
  ArrowLeft,
  Shield,
  User,
  Mail,
  Phone,
  Edit
} from "lucide-react";
import WarrantyList from "@/components/warranties/WarrantyList";
import { AddWarrantyModal } from "@/components/properties/AddWarrantyModal";
import { EditPropertyModal } from "@/components/properties/EditPropertyModal";
import { useState } from "react";

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showWarrantyModal, setShowWarrantyModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

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

  if (isLoadingProperty || isLoadingMaintenance) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/properties')}
          className="bg-white/[0.03] backdrop-blur-xl border-white/[0.05]"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{property?.title}</h1>
          <p className="text-muted-foreground">{property?.address}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowEditModal(true)}
          className="bg-white/[0.03] backdrop-blur-xl border-white/[0.05]"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Property
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Property Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Client Information</h3>
                <div className="space-y-2">
                  {property?.owner_name && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{property.owner_name}</span>
                    </div>
                  )}
                  {property?.owner_email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${property.owner_email}`} className="hover:underline">
                        {property.owner_email}
                      </a>
                    </div>
                  )}
                  {property?.owner_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${property.owner_phone}`} className="hover:underline">
                        {property.owner_phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
              
              {property?.smart_contract_address && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Smart Contract</h3>
                  <p className="font-mono text-xs break-all bg-white/5 p-2 rounded">
                    {property.smart_contract_address}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Warranties
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowWarrantyModal(true)}
                className="bg-white/[0.03] backdrop-blur-xl border-white/[0.05]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Warranty
              </Button>
            </div>
            <CardDescription>
              Manage property warranties and coverage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WarrantyList propertyId={id} />
          </CardContent>
        </Card>

        <Card className="col-span-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Maintenance History
            </CardTitle>
            <CardDescription>
              View and manage maintenance records
            </CardDescription>
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
      
      <AddWarrantyModal
        open={showWarrantyModal}
        onOpenChange={setShowWarrantyModal}
        propertyId={id!}
      />
      
      <EditPropertyModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        property={property}
      />
    </div>
  );
}