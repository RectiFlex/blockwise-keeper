import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Link } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";

type Property = Tables<"properties">;

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <RouterLink to={`/properties/${property.id}`}>
      <Card className="hover:shadow-lg transition-shadow card-gradient">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {property.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{property.address}</p>
            <div className="mt-4">
              {property.smart_contract_address ? (
                <div className="space-y-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Link className="h-3 w-3" />
                    Smart Contract Active
                  </Badge>
                  <p className="text-xs font-mono break-all bg-primary/5 p-2 rounded">
                    {property.smart_contract_address}
                  </p>
                </div>
              ) : (
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
                  No Smart Contract
                </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground mt-4">
              Added {new Date(property.created_at).toLocaleDateString()}
            </div>
          </div>
        </CardContent>
      </Card>
    </RouterLink>
  );
}