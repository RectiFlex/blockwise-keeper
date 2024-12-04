import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

type MaintenanceRequestFormData = {
  title: string;
  description: string;
  priority: string;
  property_id: string;
};

// UUID validation regex pattern
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function MaintenanceRequestForm({ onSuccess }: { onSuccess: () => void }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<MaintenanceRequestFormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const onSubmit = async (data: MaintenanceRequestFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('maintenance_requests')
        .insert([
          {
            ...data,
            requester_id: (await supabase.auth.getUser()).data.user?.id,
          }
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Maintenance request submitted successfully",
      });
      reset();
      onSuccess();
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Error",
        description: "Failed to submit maintenance request. Please ensure all fields are valid.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          {...register("title", { required: "Title is required" })}
          placeholder="Brief description of the issue"
        />
        {errors.title && (
          <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register("description", { required: "Description is required" })}
          placeholder="Detailed description of the maintenance request"
          className="h-32"
        />
        {errors.description && (
          <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="priority">Priority</Label>
        <select
          id="priority"
          {...register("priority")}
          className="w-full rounded-md border border-input bg-background px-3 py-2"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div>
        <Label htmlFor="property_id">Property ID (UUID format)</Label>
        <Input
          id="property_id"
          {...register("property_id", { 
            required: "Property ID is required",
            pattern: {
              value: UUID_PATTERN,
              message: "Please enter a valid UUID format"
            }
          })}
          placeholder="xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
        />
        {errors.property_id && (
          <p className="text-sm text-red-500 mt-1">{errors.property_id.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Request"}
      </Button>
    </form>
  );
}