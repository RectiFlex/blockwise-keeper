import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Warranty {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  status: string;
  property_id: string;
}

export default function WarrantyList({ propertyId }: { propertyId?: string }) {
  const { data: warranties, isLoading } = useQuery({
    queryKey: ['warranties', propertyId],
    queryFn: async () => {
      const query = supabase
        .from('warranties')
        .select('*')
        .order('end_date', { ascending: true });

      if (propertyId) {
        query.eq('property_id', propertyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Warranty[];
    },
  });

  const getWarrantyStatus = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const daysRemaining = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining < 0) return { status: 'expired', color: 'bg-red-500/10 text-red-500' };
    if (daysRemaining < 30) return { status: 'expiring soon', color: 'bg-yellow-500/10 text-yellow-500' };
    return { status: 'active', color: 'bg-green-500/10 text-green-500' };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse">Loading warranties...</div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Active Warranties
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {warranties && warranties.length > 0 ? (
            <div className="space-y-4">
              {warranties.map((warranty) => {
                const { status, color } = getWarrantyStatus(warranty.end_date);
                return (
                  <div
                    key={warranty.id}
                    className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{warranty.title}</h3>
                      <Badge className={color}>{status}</Badge>
                    </div>
                    {warranty.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {warranty.description}
                      </p>
                    )}
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>Start: {new Date(warranty.start_date).toLocaleDateString()}</span>
                      <span>End: {new Date(warranty.end_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No warranties found</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}