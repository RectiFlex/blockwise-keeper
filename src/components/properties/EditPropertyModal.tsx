import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
import { Tables } from "@/integrations/supabase/types";

interface EditPropertyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: Tables<"properties"> | null;
}

export function EditPropertyModal({ open, onOpenChange, property }: EditPropertyModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      title: property?.title || "",
      address: property?.address || "",
      ownerName: property?.owner_name || "",
      ownerEmail: property?.owner_email || "",
      ownerPhone: property?.owner_phone || "",
    },
  });

  const updatePropertyMutation = useMutation({
    mutationFn: async (values: PropertyFormValues) => {
      const { data, error } = await supabase
        .from('properties')
        .update({
          title: values.title,
          address: values.address,
          owner_name: values.ownerName,
          owner_email: values.ownerEmail,
          owner_phone: values.ownerPhone,
        })
        .eq('id', property?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property', property?.id] });
      toast({
        title: "Success",
        description: "Property updated successfully",
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update property",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Property</DialogTitle>
          <DialogDescription>
            Update property information and client details
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => updatePropertyMutation.mutate(data))} className="space-y-4">
            <PropertyFormFields form={form} />
            <Button 
              type="submit" 
              className="w-full"
              disabled={updatePropertyMutation.isPending}
            >
              {updatePropertyMutation.isPending ? "Updating..." : "Save Changes"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}