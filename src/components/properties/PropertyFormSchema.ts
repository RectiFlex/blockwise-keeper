import * as z from "zod";

export const propertyFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  address: z.string().min(1, "Address is required").max(200, "Address is too long"),
  ownerName: z.string().min(1, "Owner name is required"),
  ownerEmail: z.string().email("Invalid email address"),
  ownerPhone: z.string().min(1, "Phone number is required")
    .regex(/^\+?[\d\s-()]+$/, "Invalid phone number format"),
});

export type PropertyFormValues = z.infer<typeof propertyFormSchema>;