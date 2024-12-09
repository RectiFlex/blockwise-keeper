import * as z from "zod";

export const workOrderSchema = z.object({
  contractor_id: z.string().min(1, "Please select a contractor"),
  estimated_cost: z.string()
    .refine(val => !val || !isNaN(parseFloat(val)), {
      message: "Must be a valid number",
    }),
  scheduled_date: z.string().min(1, "Please select a date"),
  notes: z.string().optional(),
});

export type WorkOrderFormData = z.infer<typeof workOrderSchema>;