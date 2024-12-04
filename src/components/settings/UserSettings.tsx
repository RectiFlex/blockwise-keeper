import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const userSettingsSchema = z.object({
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

type UserSettingsFormValues = z.infer<typeof userSettingsSchema>;

export default function UserSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<UserSettingsFormValues>({
    resolver: zodResolver(userSettingsSchema),
    defaultValues: {
      notification_preferences: {
        email: true,
        push: true,
      },
      theme_preferences: {
        darkMode: false,
      },
    },
  });

  const { data: userSettings, isLoading } = useQuery({
    queryKey: ["userSettings"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: UserSettingsFormValues) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      if (userSettings?.id) {
        const { error } = await supabase
          .from("user_settings")
          .update(values)
          .eq("id", userSettings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_settings")
          .insert([{ ...values, user_id: user.id }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSettings"] });
      toast({
        title: "Settings saved",
        description: "Your user settings have been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (userSettings) {
      const notificationPrefs = userSettings.notification_preferences as { email: boolean; push: boolean };
      const themePrefs = userSettings.theme_preferences as { darkMode: boolean };
      
      form.reset({
        notification_preferences: {
          email: notificationPrefs?.email ?? true,
          push: notificationPrefs?.push ?? true,
        },
        theme_preferences: {
          darkMode: themePrefs?.darkMode ?? false,
        },
      });
    }
  }, [userSettings, form]);

  const onSubmit = (values: UserSettingsFormValues) => {
    mutation.mutate(values);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="p-6 glass card-gradient space-y-4">
        <h3 className="text-xl font-semibold">User Preferences</h3>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            <Button
              type="submit"
              disabled={mutation.isPending}
              className="w-full"
            >
              {mutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}