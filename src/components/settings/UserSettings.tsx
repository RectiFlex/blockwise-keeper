import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { NotificationSettings } from "./NotificationSettings";
import { ThemeSettings } from "./ThemeSettings";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { userSettingsSchema, type UserSettingsFormValues, parseUserSettings } from "./UserSettingsSchema";

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
      demo_mode: false,
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
      const parsedSettings = parseUserSettings(userSettings);
      form.reset(parsedSettings);
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
            <NotificationSettings form={form} />
            <ThemeSettings form={form} />
            
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="demo_mode">Demo Mode</Label>
              <Switch
                id="demo_mode"
                checked={form.watch("demo_mode")}
                onCheckedChange={(checked) => form.setValue("demo_mode", checked)}
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