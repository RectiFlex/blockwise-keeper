import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { UserSettingsFormValues } from "./UserSettingsSchema";

interface ThemeSettingsProps {
  form: UseFormReturn<UserSettingsFormValues>;
}

export function ThemeSettings({ form }: ThemeSettingsProps) {
  return (
    <div className="space-y-4">
      <h4 className="font-medium">Theme Settings</h4>
      <FormField
        control={form.control}
        name="theme_preferences.darkMode"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Dark Mode</FormLabel>
            </div>
            <FormControl>
              <input
                type="checkbox"
                checked={field.value}
                onChange={field.onChange}
                className="h-4 w-4"
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}