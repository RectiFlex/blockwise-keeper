import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface WarrantyAnalysis {
  coverage: string[];
  suggestions: string[];
}

export default function AIWarrantyAnalysis() {
  const { data: analysis, isLoading } = useQuery<WarrantyAnalysis>({
    queryKey: ['warranty-analysis'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('analyze-warranty-data', {
        body: { type: 'full-analysis' }
      });
      
      if (error) throw error;
      return data.analysis;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Warranty Coverage Analysis</CardTitle>
          <CardDescription>
            AI-generated insights about your warranty coverage and requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-4">
              {analysis?.coverage?.map((item: string, i: number) => (
                <p key={i} className="text-sm">{item}</p>
              )) || <p className="text-sm text-muted-foreground">No coverage analysis available</p>}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Improvement Suggestions</CardTitle>
          <CardDescription>
            AI recommendations for better warranty management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-4">
              {analysis?.suggestions?.map((item: string, i: number) => (
                <p key={i} className="text-sm">{item}</p>
              )) || <p className="text-sm text-muted-foreground">No suggestions available</p>}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}