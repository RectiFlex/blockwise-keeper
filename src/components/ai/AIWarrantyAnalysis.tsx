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
  const { data: analysis, isLoading, error } = useQuery<WarrantyAnalysis>({
    queryKey: ['warranty-analysis'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('analyze-warranty-data', {
        body: { type: 'full-analysis' }
      });
      
      if (error) throw error;
      
      // Ensure the response is properly formatted
      const formattedData = {
        coverage: Array.isArray(data?.analysis?.coverage) ? data.analysis.coverage : [],
        suggestions: Array.isArray(data?.analysis?.suggestions) ? data.analysis.suggestions : []
      };
      
      return formattedData;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        Error loading analysis. Please try again later.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Warranty Coverage Analysis</CardTitle>
          <CardDescription>AI-generated insights about your warranty coverage and requirements</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-4">
              {analysis?.coverage?.map((item: any, i: number) => (
                <p key={i} className="text-sm">{typeof item === 'string' ? item : JSON.stringify(item)}</p>
              )) || <p className="text-sm text-muted-foreground">No coverage analysis available</p>}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Improvement Suggestions</CardTitle>
          <CardDescription>AI recommendations for better warranty management</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-4">
              {analysis?.suggestions?.map((item: any, i: number) => (
                <p key={i} className="text-sm">{typeof item === 'string' ? item : JSON.stringify(item)}</p>
              )) || <p className="text-sm text-muted-foreground">No suggestions available</p>}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}