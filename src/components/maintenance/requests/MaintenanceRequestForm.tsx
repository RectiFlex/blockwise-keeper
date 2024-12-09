import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LoadingState } from "@/components/ui/loading-state";
import { maintenanceRequestSchema, type MaintenanceRequestFormData } from "./MaintenanceRequestSchema";
import { MaintenanceRequestFields } from "./MaintenanceRequestFields";
import { usePropertyData } from "@/hooks/use-properties";

interface MaintenanceRequestFormProps {
  onSuccess: () => void;
}

export function MaintenanceRequestForm({ onSuccess }: MaintenanceRequestFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const form = useForm<MaintenanceRequestFormData>({
    resolver: zodResolver(maintenanceRequestSchema),
    defaultValues: {
      priority: "medium",
    },
  });

  const { data: properties, isLoading: isLoadingProperties, error: propertiesError } = usePropertyData();

  const onSubmit = async (formData: MaintenanceRequestFormData) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('maintenance_requests')
        .insert({
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          property_id: formData.property_id,
          requester_id: user.id,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Maintenance request submitted successfully",
      });
      form.reset();
      onSuccess();
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit maintenance request",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingProperties) {
    return <LoadingState message="Loading properties..." />;
  }

  if (propertiesError) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500">Error loading properties. Please try again later.</p>
      </div>
    );
  }

  if (!properties || properties.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-muted-foreground">No properties found. Please add a property first.</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <MaintenanceRequestFields form={form} properties={properties} />
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Submitting..." : "Submit Request"}
        </Button>
      </form>
    </Form>
  );
}