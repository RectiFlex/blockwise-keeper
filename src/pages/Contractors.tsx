import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import CreateContractorModal from "@/components/contractors/CreateContractorModal";
import EditContractorModal from "@/components/contractors/EditContractorModal";

export default function Contractors() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState<any>(null);
  const { toast } = useToast();

  const { data: contractors, refetch } = useQuery({
    queryKey: ["contractors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contractors")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("contractors")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete contractor",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Contractor deleted successfully",
    });
    refetch();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Contractors</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2" />
          Add Contractor
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contractors?.map((contractor) => (
          <div key={contractor.id} className="p-6 glass card-gradient space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold">{contractor.name}</h3>
                {contractor.company_name && (
                  <p className="text-gray-400">{contractor.company_name}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedContractor(contractor)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(contractor.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-gray-400">
                <span className="font-medium">Email:</span> {contractor.email}
              </p>
              {contractor.phone && (
                <p className="text-gray-400">
                  <span className="font-medium">Phone:</span> {contractor.phone}
                </p>
              )}
              {contractor.specialties && contractor.specialties.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {contractor.specialties.map((specialty: string) => (
                    <span
                      key={specialty}
                      className="px-2 py-1 rounded-full text-xs bg-white/10"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              )}
              {contractor.hourly_rate && (
                <p className="text-gray-400">
                  <span className="font-medium">Rate:</span> ${contractor.hourly_rate}/hr
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <CreateContractorModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={() => {
          refetch();
          setIsCreateModalOpen(false);
        }}
      />

      <EditContractorModal
        contractor={selectedContractor}
        onOpenChange={(open) => !open && setSelectedContractor(null)}
        onSuccess={() => {
          refetch();
          setSelectedContractor(null);
        }}
      />
    </div>
  );
}