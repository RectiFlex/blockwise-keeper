import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Select from "react-select";
import * as z from "zod";
import { Database } from "@/integrations/supabase/types";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { WorkOrderPDF } from "./WorkOrderPDF";

const workOrderSchema = z.object({
  contractor_id: z.string().optional(),
  estimated_cost: z.string().optional(),
  scheduled_date: z.string().optional(),
  notes: z.string().optional(),
});

type WorkOrderFormValues = z.infer<typeof workOrderSchema>;
type MaintenanceRequest = Database["public"]["Tables"]["maintenance_requests"]["Row"];
type Contractor = Database["public"]["Tables"]["contractors"]["Row"];

interface WorkOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: MaintenanceRequest;
  workOrder?: any;
}

export function WorkOrderModal({ open, onOpenChange, request, workOrder }: WorkOrderModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);

  const { data: contractors } = useQuery({
    queryKey: ['contractors'],
    queryFn: async () => {
      const { data } = await supabase
        .from('contractors')
        .select('*');
      return data as Contractor[];
    },
  });

  const form = useForm<WorkOrderFormValues>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: {
      contractor_id: workOrder?.contractor_id || "",
      estimated_cost: workOrder?.estimated_cost?.toString() || "",
      scheduled_date: workOrder?.scheduled_date || "",
      notes: workOrder?.notes || "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: WorkOrderFormValues) => {
      const payload = {
        ...values,
        maintenance_request_id: request.id,
        estimated_cost: values.estimated_cost ? parseFloat(values.estimated_cost) : null,
      };

      if (workOrder?.id) {
        const { error } = await supabase
          .from('work_orders')
          .update(payload)
          .eq('id', workOrder.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('work_orders')
          .insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
      toast({
        title: "Success",
        description: workOrder ? "Work order updated" : "Work order created",
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{workOrder ? "Edit Work Order" : "Create Work Order"}</DialogTitle>
          <DialogDescription>
            {request.title}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="contractor_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign Contractor</FormLabel>
                  <Select
                    options={contractors?.map(c => ({
                      value: c.id,
                      label: c.name,
                      contractor: c
                    }))}
                    value={contractors?.find(c => c.id === field.value)?.id}
                    onChange={(option) => {
                      field.onChange(option?.value);
                      setSelectedContractor(option?.contractor || null);
                    }}
                    className="text-foreground"
                    styles={{
                      control: (base) => ({
                        ...base,
                        background: 'transparent',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                      }),
                      menu: (base) => ({
                        ...base,
                        background: 'rgba(0, 0, 0, 0.8)',
                        backdropFilter: 'blur(10px)',
                      }),
                      option: (base, state) => ({
                        ...base,
                        background: state.isFocused ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                        color: 'white',
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: 'white',
                      }),
                    }}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estimated_cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Cost</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scheduled_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scheduled Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                {workOrder ? "Update" : "Create"} Work Order
              </Button>
              
              {workOrder && (
                <PDFDownloadLink
                  document={
                    <WorkOrderPDF 
                      workOrder={workOrder}
                      request={request}
                      contractor={selectedContractor}
                    />
                  }
                  fileName={`work-order-${workOrder.id}.pdf`}
                >
                  {({ loading }) => (
                    <Button variant="outline" disabled={loading}>
                      Export PDF
                    </Button>
                  )}
                </PDFDownloadLink>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}