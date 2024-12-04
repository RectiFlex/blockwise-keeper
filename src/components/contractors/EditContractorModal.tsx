import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { ContractorFormFields } from "./ContractorFormFields";
import { contractorFormSchema, type ContractorFormValues } from "./ContractorFormSchema";
import { ConfirmContractorDialog } from "./ConfirmContractorDialog";

interface EditContractorModalProps {
  contractor: any;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function EditContractorModal({
  contractor,
  onOpenChange,
  onSuccess,
}: EditContractorModalProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<ContractorFormValues>({
    resolver: zodResolver(contractorFormSchema),
    defaultValues: {
      name: "",
      company_name: "",
      email: "",
      phone: "",
      specialties: "",
      hourly_rate: "",
    },
  });

  useEffect(() => {
    if (contractor) {
      form.reset({
        name: contractor.name || "",
        company_name: contractor.company_name || "",
        email: contractor.email || "",
        phone: contractor.phone || "",
        specialties: contractor.specialties?.join(", ") || "",
        hourly_rate: contractor.hourly_rate?.toString() || "",
      });
    }
  }, [contractor, form]);

  const onSubmit = async (data: ContractorFormValues) => {
    setShowConfirmDialog(true);
  };

  const handleConfirmedSubmit = async () => {
    setShowConfirmDialog(false);
    const formData = form.getValues();
    
    try {
      const { error } = await supabase
        .from("contractors")
        .update({
          ...formData,
          specialties: formData.specialties.split(",").map((s) => s.trim()),
          hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
        })
        .eq("id", contractor.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Contractor updated successfully",
      });
      onSuccess();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update contractor",
      });
    }
  };

  if (!contractor) return null;

  return (
    <>
      <Dialog open={!!contractor} onOpenChange={onOpenChange}>
        <DialogContent className="glass sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Contractor</DialogTitle>
            <DialogDescription>
              Make changes to the contractor's information below.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <ContractorFormFields form={form} />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmContractorDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={handleConfirmedSubmit}
        title="Confirm Changes"
        description="Are you sure you want to save these changes to the contractor's information?"
      />
    </>
  );
}