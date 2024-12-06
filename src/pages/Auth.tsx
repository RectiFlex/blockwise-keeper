import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ThreeBackground from "@/components/auth/ThreeBackground";

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        toast({
          title: "Welcome!",
          description: "You have successfully signed in.",
        });
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background/50">
      <ThreeBackground />
      <div className="w-full max-w-md space-y-8 glass p-8 rounded-2xl shadow-2xl backdrop-blur-xl">
        <div className="text-center space-y-4">
          <img 
            src="/lovable-uploads/787661a7-8b14-4770-a8e4-b70371bfb96d.png" 
            alt="Logo" 
            className="h-12 mx-auto"
          />
          <h2 className="text-3xl font-bold text-foreground">Welcome Back</h2>
          <p className="text-muted-foreground">Sign in with GitHub or email to continue</p>
        </div>
        
        <SupabaseAuth 
          supabaseClient={supabase} 
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'hsl(var(--primary))',
                  brandAccent: 'hsl(var(--primary))',
                  inputBackground: 'hsl(var(--background))',
                  inputText: 'hsl(var(--foreground))',
                }
              }
            },
            className: {
              container: 'space-y-4',
              button: 'bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-lg w-full',
              input: 'bg-background/50 backdrop-blur-sm border border-input rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary',
              label: 'text-foreground',
            }
          }}
          providers={["github"]}
          view="sign_in"
          showLinks={true}
        />
      </div>
    </div>
  );
}