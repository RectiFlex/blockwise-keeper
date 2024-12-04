import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { UserSettingsFormValues } from "./UserSettingsSchema";

interface NotificationSettingsProps {
  form: UseFormReturn<UserSettingsFormValues>;
}

export function NotificationSettings({ form }: NotificationSettingsProps) {
  return (
    <div className="space-y-4">
      <h4 className="font-medium">Notification Settings</h4>
      <FormField
        control={form.control}
        name="notification_preferences.email"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">
                Email Notifications
              </FormLabel>
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
      <FormField
        control={form.control}
        name="notification_preferences.push"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">
                Push Notifications
              </FormLabel>
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