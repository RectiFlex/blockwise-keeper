import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EditContractorModalProps {
  contractor: any;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function EditContractorModal({
  contractor,
  onOpenChange,
  onSuccess,
}: EditContractorModalProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    company_name: "",
    email: "",
    phone: "",
    specialties: "",
    hourly_rate: "",
  });

  useEffect(() => {
    if (contractor) {
      setFormData({
        name: contractor.name || "",
        company_name: contractor.company_name || "",
        email: contractor.email || "",
        phone: contractor.phone || "",
        specialties: contractor.specialties?.join(", ") || "",
        hourly_rate: contractor.hourly_rate?.toString() || "",
      });
    }
  }, [contractor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractor) return;
    
    setLoading(true);

    const { error } = await supabase
      .from("contractors")
      .update({
        ...formData,
        specialties: formData.specialties.split(",").map((s) => s.trim()),
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
      })
      .eq("id", contractor.id);

    setLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update contractor",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Contractor updated successfully",
    });
    onSuccess();
  };

  if (!contractor) return null;

  return (
    <Dialog open={!!contractor} onOpenChange={onOpenChange}>
      <DialogContent className="glass sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Contractor</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company Name</Label>
            <Input
              id="company"
              value={formData.company_name}
              onChange={(e) =>
                setFormData({ ...formData, company_name: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="specialties">
              Specialties (comma-separated)
            </Label>
            <Input
              id="specialties"
              value={formData.specialties}
              onChange={(e) =>
                setFormData({ ...formData, specialties: e.target.value })
              }
              placeholder="e.g. Plumbing, Electrical, HVAC"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rate">Hourly Rate ($)</Label>
            <Input
              id="rate"
              type="number"
              step="0.01"
              value={formData.hourly_rate}
              onChange={(e) =>
                setFormData({ ...formData, hourly_rate: e.target.value })
              }
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}