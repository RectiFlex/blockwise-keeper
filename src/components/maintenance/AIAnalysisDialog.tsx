import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AIAnalysisDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  analysis: string | null;
  isAnalyzing: boolean;
}

export function AIAnalysisDialog({
  isOpen,
  onOpenChange,
  analysis,
  isAnalyzing,
}: AIAnalysisDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>AI Analysis</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {isAnalyzing ? (
            <div className="flex items-center justify-center p-4">
              <span className="animate-pulse">Analyzing request...</span>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap font-sans">{analysis}</pre>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}