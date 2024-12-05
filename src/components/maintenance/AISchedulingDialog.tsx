import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

interface AISchedulingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  analysis: string | null;
  isAnalyzing: boolean;
}

export function AISchedulingDialog({
  isOpen,
  onOpenChange,
  analysis,
  isAnalyzing,
}: AISchedulingDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>AI Scheduling Analysis</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] w-full pr-4">
          {isAnalyzing ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Analyzing scheduling options...</span>
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