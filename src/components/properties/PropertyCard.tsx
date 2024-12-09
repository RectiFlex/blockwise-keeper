import { Card } from "@/components/ui/card";
import { Building2, Link, Calendar, FileText, DollarSign, AlertTriangle, Shield, User, Phone, Mail } from "lucide-react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AddWarrantyModal } from "./AddWarrantyModal";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type Property = Tables<"properties">;

interface PropertyCardProps {
  property: Property;
  maintenanceCount?: number;
  totalExpenses?: number;
}

export function PropertyCard({ property, maintenanceCount = 0, totalExpenses = 0 }: PropertyCardProps) {
  const navigate = useNavigate();
  const getPropertyTypeColor = (address: string) => {
    if (address.toLowerCase().includes('industrial')) return 'text-purple-400';
    if (address.toLowerCase().includes('business')) return 'text-blue-400';
    return 'text-green-400';
  };

  const getPropertyType = (address: string) => {
    if (address.toLowerCase().includes('industrial')) return 'Industrial';
    if (address.toLowerCase().includes('business')) return 'Commercial';
    return 'Residential';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const [showWarrantyModal, setShowWarrantyModal] = useState(false);

  const { data: warranties } = useQuery({
    queryKey: ['warranties', property.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('warranties')
        .select('*')
        .eq('property_id', property.id);
      return data || [];
    },
  });

  const activeWarranties = warranties?.filter(w => 
    new Date(w.end_date) > new Date()
  ).length || 0;

  return (
    <>
      <Card 
        className="hover:shadow-lg transition-shadow card-gradient h-full cursor-pointer" 
        onClick={() => navigate(`/properties/${property.id}`)}
      >
        <div className="p-6 space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-3 glass rounded-xl">
              <Building2 className="h-6 w-6 text-accent" />
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="font-semibold text-lg">{property.title}</h3>
              <p className="text-sm text-muted-foreground">{property.address}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Type</p>
              <p className={`font-medium ${getPropertyTypeColor(property.address)}`}>
                {getPropertyType(property.address)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Size</p>
              <p className="font-medium">25,000 sq ft</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Status</p>
              <p className="font-medium text-green-400">Active</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Created</p>
              <p className="font-medium">
                {new Date(property.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {property.smart_contract_address && (
            <div className="pt-2">
              <p className="text-xs font-mono text-muted-foreground break-all">
                {property.smart_contract_address}
              </p>
            </div>
          )}

          {/* Client Information */}
          <div className="space-y-2 pt-4 border-t border-white/5">
            <h4 className="text-sm font-medium mb-2">Client Details</h4>
            <div className="space-y-2">
              {property.owner_name && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{property.owner_name}</span>
                </div>
              )}
              {property.owner_email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={`mailto:${property.owner_email}`} 
                    className="hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {property.owner_email}
                  </a>
                </div>
              )}
              {property.owner_phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={`tel:${property.owner_phone}`} 
                    className="hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {property.owner_phone}
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
            <div className="glass p-4 space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>Maintenance Records</span>
              </div>
              <p className="text-2xl font-semibold">{maintenanceCount}</p>
            </div>
            <div className="glass p-4 space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span>Total Expenses</span>
              </div>
              <p className="text-2xl font-semibold">{formatCurrency(totalExpenses)}</p>
            </div>
          </div>

          <div 
            className="glass p-4 space-y-1 cursor-pointer" 
            onClick={(e) => {
              e.stopPropagation();
              setShowWarrantyModal(true);
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Active Warranties</span>
              </div>
              <span className="text-2xl font-semibold">{activeWarranties}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Last updated: {new Date(property.updated_at).toLocaleString()}</span>
          </div>
          
          {!property.smart_contract_address && (
            <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg flex items-center gap-2 text-yellow-500">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <div className="flex-1">
                <span className="text-sm font-medium">Smart contract not deployed</span>
                <p className="text-xs mt-1 text-yellow-500/80">
                  This property is not verified on the blockchain. Deploy a smart contract to enable verification.
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
      
      <AddWarrantyModal 
        open={showWarrantyModal}
        onOpenChange={setShowWarrantyModal}
        propertyId={property.id}
      />
    </>
  );
}