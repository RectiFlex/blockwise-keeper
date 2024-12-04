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
  demo_mode: z.boolean().default(false),
});

export type UserSettingsFormValues = z.infer<typeof userSettingsSchema>;

// Helper function to parse JSON settings from Supabase
export const parseUserSettings = (settings: any) => {
  const defaultSettings = {
    notification_preferences: {
      email: true,
      push: true,
    },
    theme_preferences: {
      darkMode: false,
    },
    demo_mode: false,
  };

  if (!settings) return defaultSettings;

  try {
    return {
      notification_preferences: {
        email: settings.notification_preferences?.email ?? defaultSettings.notification_preferences.email,
        push: settings.notification_preferences?.push ?? defaultSettings.notification_preferences.push,
      },
      theme_preferences: {
        darkMode: settings.theme_preferences?.darkMode ?? defaultSettings.theme_preferences.darkMode,
      },
      demo_mode: settings.demo_mode ?? defaultSettings.demo_mode,
    };
  } catch (error) {
    return defaultSettings;
  }
};