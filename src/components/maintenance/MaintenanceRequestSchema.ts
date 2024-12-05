import * as z from "zod";

export const maintenanceRequestSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priority: z.enum(["low", "medium", "high"]),
  property_id: z.string().uuid("Please select a property"),
});

export type MaintenanceRequestFormData = z.infer<typeof maintenanceRequestSchema>;