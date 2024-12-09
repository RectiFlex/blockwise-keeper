import * as z from "zod";
import type { Database } from "@/types/database";

type WorkOrderStatus = Database["public"]["Enums"]["maintenance_status"];

export const workOrderSchema = z.object({
  contractor_id: z.string().optional(),
  estimated_cost: z.string()
    .refine(val => !val || !isNaN(parseFloat(val)), {
      message: "Must be a valid number",
    }),
  scheduled_date: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"] as const).default("pending"),
});

export type WorkOrderFormValues = z.infer<typeof workOrderSchema>;