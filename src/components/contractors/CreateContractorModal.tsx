import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import ContractorForm from "./ContractorForm";
import ConfirmContractorDialog from "./ConfirmContractorDialog";
import type { ContractorFormValues } from "./ContractorFormSchema";

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
    console.log("Data received in CreateContractorModal:", data);
    setFormData(data);
    setShowConfirmDialog(true);
  };

  const handleConfirmedSubmit = async () => {
    if (!formData) return;
    setShowConfirmDialog(false);
    
    try {
      console.log("Processing contractor data:", formData);
      const contractorData: Contractor = {
        name: formData.name,
        email: formData.email,
        company_name: formData.company_name || null,
        phone: formData.phone || null,
        specialties: formData.specialties.split(",").map((s) => s.trim()),
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
      };

      console.log("Submitting to Supabase:", contractorData);
      const { error } = await supabase.from("contractors").insert(contractorData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Contractor created successfully",
      });
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error creating contractor:", error);
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