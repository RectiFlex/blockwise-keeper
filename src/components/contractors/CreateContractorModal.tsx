import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import ContractorForm, { ContractorFormValues } from "./ContractorForm";
import ConfirmContractorDialog from "./ConfirmContractorDialog";

type Contractor = Database['public']['Tables']['contractors']['Insert'];

interface CreateContractorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function CreateContractorModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateContractorModalProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [formData, setFormData] = useState<ContractorFormValues | null>(null);
  const { toast } = useToast();

  const onSubmit = (data: ContractorFormValues) => {
    setFormData(data);
    setShowConfirmDialog(true);
  };

  const handleConfirmedSubmit = async () => {
    if (!formData) return;
    setShowConfirmDialog(false);
    
    try {
      const contractorData: Contractor = {
        name: formData.name,
        email: formData.email,
        company_name: formData.company_name || null,
        phone: formData.phone || null,
        specialties: formData.specialties.split(",").map((s) => s.trim()),
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
      };

      const { error } = await supabase.from("contractors").insert(contractorData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Contractor created successfully",
      });
      onSuccess();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create contractor",
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="glass sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Contractor</DialogTitle>
            <DialogDescription>
              Enter the contractor's information below.
            </DialogDescription>
          </DialogHeader>
          <ContractorForm onSubmit={onSubmit} />
        </DialogContent>
      </Dialog>

      <ConfirmContractorDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={handleConfirmedSubmit}
        title="Confirm Creation"
        description="Are you sure you want to create this contractor with the provided information?"
      />
    </>
  );
}