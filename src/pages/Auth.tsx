import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        toast({
          title: "Welcome!",
          description: "You have successfully signed in.",
        });
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 glass card-gradient p-8 rounded-2xl">
        <div className="text-center space-y-4">
          <img 
            src="/lovable-uploads/787661a7-8b14-4770-a8e4-b70371bfb96d.png" 
            alt="Logo" 
            className="h-12 mx-auto"
          />
          <h2 className="text-3xl font-bold">Welcome Back</h2>
          <p className="text-gray-400 mt-2">Sign in to your account to continue</p>
        </div>
        
        <SupabaseAuth 
          supabaseClient={supabase} 
          providers={[]}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#3b82f6',
                  brandAccent: '#2563eb',
                }
              }
            },
            className: {
              container: 'space-y-4',
              button: 'bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg w-full',
              input: 'bg-white/5 border border-white/10 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500',
            }
          }}
        />
      </div>
    </div>
  );
}