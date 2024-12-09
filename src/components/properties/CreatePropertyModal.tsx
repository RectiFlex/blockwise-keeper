import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
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
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { PropertyFormFields } from "./PropertyFormFields";
import { propertyFormSchema, type PropertyFormValues } from "./PropertyFormSchema";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface CreatePropertyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePropertyModal({ open, onOpenChange }: CreatePropertyModalProps) {
  const [isDeploying, setIsDeploying] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [skipContract, setSkipContract] = useState(false);
  const [deployError, setDeployError] = useState<string | null>(null);
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
        let contractAddress = null;
        
        if (!skipContract) {
          try {
            await web3Service.connectWallet();
            contractAddress = await web3Service.deployPropertyContract(
              crypto.randomUUID(),
              values.title,
              values.address
            );
            setDeployError(null);
          } catch (error: any) {
            setDeployError(error.message);
            toast({
              title: "Smart Contract Deployment Failed",
              description: error.message,
              variant: "destructive",
            });
            setSkipContract(true);
          }
        }

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
            {!skipContract ? (
              <>
                <DialogDescription>
                  Enter the property details below. This will create a new smart contract.
                </DialogDescription>
                {deployError && (
                  <div className="mt-2 p-2 rounded-md bg-destructive/10 text-destructive text-sm">
                    {deployError}
                  </div>
                )}
              </>
            ) : (
              <DialogDescription className="text-yellow-500">
                Adding property without smart contract. You can deploy the contract later.
              </DialogDescription>
            )}
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <PropertyFormFields form={form} />
              {!skipContract && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setSkipContract(true)}
                >
                  Skip Smart Contract
                </Button>
              )}
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
              {skipContract ? 
                "This will add the property without blockchain verification. You can deploy the contract later." :
                "This action will deploy a new smart contract and create a property record. Are you sure you want to continue?"
              }
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