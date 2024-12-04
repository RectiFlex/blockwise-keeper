import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Brain } from "lucide-react";
import AIWarrantyAnalysis from "@/components/ai/AIWarrantyAnalysis";
import AIChat from "@/components/ai/AIChat";

export default function AI() {
  const [activeTab, setActiveTab] = useState("chat");

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">AI Assistant</h1>
        <p className="text-muted-foreground">
          Get AI-powered insights about warranty requirements and property management
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="chat">Chat Assistant</TabsTrigger>
          <TabsTrigger value="analysis">Warranty Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-4">
          <AIChat />
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <AIWarrantyAnalysis />
        </TabsContent>
      </Tabs>
    </div>
  );
}