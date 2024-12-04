import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { web3Service } from "@/services/web3Service";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

// Move form schema to a separate validation file
const propertyFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  address: z.string().min(1, "Address is required").max(200, "Address is too long"),
  ownerName: z.string().min(1, "Owner name is required"),
  ownerEmail: z.string().email("Invalid email address"),
  ownerPhone: z.string().min(1, "Phone number is required")
    .regex(/^\+?[\d\s-()]+$/, "Invalid phone number format"),
});

type PropertyFormValues = z.infer<typeof propertyFormSchema>;

interface CreatePropertyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePropertyModal({ open, onOpenChange }: CreatePropertyModalProps) {
  const [isDeploying, setIsDeploying] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      title: "",
      address: "",
      ownerName: "",
      ownerEmail: "",
      ownerPhone: "",
    },
  });

  const addPropertyMutation = useMutation({
    mutationFn: async (values: PropertyFormValues) => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("Please sign in to add a property");

      setIsDeploying(true);
      try {
        await web3Service.connectWallet();
        const contractAddress = await web3Service.deployPropertyContract(
          crypto.randomUUID(),
          values.title,
          values.address
        );

        const { data, error } = await supabase
          .from('properties')
          .insert({
            title: values.title,
            address: values.address,
            owner_id: user.id,
            smart_contract_address: contractAddress,
            owner_name: values.ownerName,
            owner_email: values.ownerEmail,
            owner_phone: values.ownerPhone,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } finally {
        setIsDeploying(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast({
        title: "Success",
        description: "Property added successfully with smart contract",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add property",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: PropertyFormValues) => {
    setShowConfirmDialog(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Property</DialogTitle>
            <DialogDescription>
              Enter the property details below. This will create a new smart contract.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter property title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter property address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ownerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter owner's name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ownerEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter owner's email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ownerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter owner's phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full"
                disabled={addPropertyMutation.isPending || isDeploying}
              >
                {isDeploying ? "Deploying Contract..." : 
                 addPropertyMutation.isPending ? "Adding Property..." : 
                 "Add Property"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Property Creation</AlertDialogTitle>
            <AlertDialogDescription>
              This action will deploy a new smart contract and create a property record. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowConfirmDialog(false);
                addPropertyMutation.mutate(form.getValues());
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}