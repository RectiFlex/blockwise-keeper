import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AIAnalysisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestId: string;
}

export function AIAnalysisDialog({ open, onOpenChange, requestId }: AIAnalysisDialogProps) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (open && requestId) {
      setIsLoading(true);
      supabase.functions
        .invoke('analyze-maintenance-request', {
          body: { requestId }
        })
        .then(({ data, error }) => {
          if (error) throw error;
          setAnalysis(data.analysis);
        })
        .catch(error => {
          console.error('Analysis error:', error);
          setAnalysis('Failed to analyze request. Please try again.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [open, requestId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>AI Analysis</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] w-full pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Analyzing request...</span>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap font-sans">{analysis}</pre>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}