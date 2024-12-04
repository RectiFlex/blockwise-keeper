import { useState } from "react";
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

  const onSubmit = (data: ContractorFormValues) => {
    setShowConfirmDialog(true);
  };

  const handleConfirmedSubmit = async () => {
    setShowConfirmDialog(false);
    const formData = form.getValues();
    
    try {
      const { error } = await supabase.from("contractors").insert({
        ...formData,
        specialties: formData.specialties.split(",").map((s) => s.trim()),
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Contractor created successfully",
      });
      onSuccess();
      form.reset();
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
                  Create Contractor
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Creation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to create this contractor with the provided information?
            </DialogDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmedSubmit}>
              Create Contractor
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}