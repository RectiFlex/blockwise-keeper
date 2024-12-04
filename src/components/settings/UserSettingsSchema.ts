import * as z from "zod";

export const userSettingsSchema = z.object({
  notification_preferences: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
  }).default({
    email: true,
    push: true,
  }),
  theme_preferences: z.object({
    darkMode: z.boolean().default(false),
  }).default({
    darkMode: false,
  }),
});

export type UserSettingsFormValues = z.infer<typeof userSettingsSchema>;