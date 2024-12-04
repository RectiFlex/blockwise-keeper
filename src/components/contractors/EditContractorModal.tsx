import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useState } from "react";

const contractorFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  company_name: z.string().optional(),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\+?[\d\s-()]+$/, "Invalid phone number format").optional(),
  specialties: z.string(),
  hourly_rate: z.string().refine((val) => !val || !isNaN(parseFloat(val)), {
    message: "Hourly rate must be a valid number",
  }),
});

type ContractorFormValues = z.infer<typeof contractorFormSchema>;

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
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input type="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="specialties"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialties (comma-separated)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Plumbing, Electrical, HVAC" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hourly_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hourly Rate ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Changes</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to save these changes to the contractor's information?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmedSubmit}>
              Save Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}