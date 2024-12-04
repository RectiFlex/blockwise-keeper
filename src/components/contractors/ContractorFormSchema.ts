import * as z from "zod";

export const contractorFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  company_name: z.string().optional(),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\+?[\d\s-()]+$/, "Invalid phone number format").optional(),
  specialties: z.string(),
  hourly_rate: z.string().refine((val) => !val || !isNaN(parseFloat(val)), {
    message: "Hourly rate must be a valid number",
  }),
});

export type ContractorFormValues = z.infer<typeof contractorFormSchema>;