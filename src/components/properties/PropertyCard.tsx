import { Card } from "@/components/ui/card";
import { Building2, Link, Calendar, FileText, DollarSign } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";

type Property = Tables<"properties">;

interface PropertyCardProps {
  property: Property;
  maintenanceCount?: number;
  totalExpenses?: number;
}

export function PropertyCard({ property, maintenanceCount = 0, totalExpenses = 0 }: PropertyCardProps) {
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

  return (
    <RouterLink to={`/properties/${property.id}`}>
      <Card className="hover:shadow-lg transition-shadow card-gradient h-full">
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

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Last updated: {new Date(property.updated_at).toLocaleString()}</span>
          </div>
        </div>
      </Card>
    </RouterLink>
  );
}