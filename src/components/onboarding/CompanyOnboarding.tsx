import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Workflow, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const formSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  businessAddress: z.string().min(5, "Please enter a valid address"),
  contactEmail: z.string().email("Please enter a valid email"),
  contactPhone: z.string().min(10, "Please enter a valid phone number"),
});

export default function CompanyOnboarding() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      businessAddress: "",
      contactEmail: "",
      contactPhone: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      console.log("Starting company creation process");
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("No user found");

      console.log("Creating company");
      // Create company
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .insert([
          { 
            name: values.companyName,
          }
        ])
        .select()
        .single();

      if (companyError) {
        console.error("Company creation error:", companyError);
        throw companyError;
      }

      console.log("Creating company settings");
      // Create company settings
      const { error: settingsError } = await supabase
        .from("company_settings")
        .insert([
          {
            company_name: values.companyName,
            business_address: values.businessAddress,
            contact_email: values.contactEmail,
            contact_phone: values.contactPhone,
          }
        ]);

      if (settingsError) {
        console.error("Settings creation error:", settingsError);
        throw settingsError;
      }

      console.log("Updating user profile");
      // Update user profile with company_id
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ 
          company_id: company.id,
          role: "owner" 
        })
        .eq("id", user.id);

      if (profileError) {
        console.error("Profile update error:", profileError);
        throw profileError;
      }

      toast({
        title: "Welcome aboard!",
        description: "Your company has been successfully set up.",
      });

      // Refresh the page to update the UI
      window.location.reload();
    } catch (error: any) {
      console.error("Onboarding error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to set up company. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container max-w-lg mx-auto py-10">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Workflow className="h-6 w-6 text-primary" />
            <CardTitle>Welcome to BlockFix</CardTitle>
          </div>
          <CardDescription>
            Let's get your company set up. Fill in the details below to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Properties" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="businessAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St, City, State" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="contact@company.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Phone</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="(555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  "Setting up..."
                ) : (
                  <span className="flex items-center gap-2">
                    Complete Setup <Check className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}