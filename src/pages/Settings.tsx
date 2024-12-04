import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CompanySettings from "@/components/settings/CompanySettings";
import UserSettings from "@/components/settings/UserSettings";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("company");
  const { toast } = useToast();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="user">User Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-6">
          <CompanySettings />
        </TabsContent>

        <TabsContent value="user" className="space-y-6">
          <UserSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}