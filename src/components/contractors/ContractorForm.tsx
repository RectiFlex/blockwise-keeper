import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ContractorFormFields } from "./ContractorFormFields";
import { contractorFormSchema, type ContractorFormValues } from "./ContractorFormSchema";

interface ContractorFormProps {
  onSubmit: (data: ContractorFormValues) => void;
  defaultValues?: Partial<ContractorFormValues>;
}

export default function ContractorForm({ onSubmit, defaultValues }: ContractorFormProps) {
  const form = useForm<ContractorFormValues>({
    resolver: zodResolver(contractorFormSchema),
    defaultValues: {
      name: "",
      company_name: "",
      email: "",
      phone: "",
      specialties: "",
      hourly_rate: "",
      ...defaultValues,
    },
  });

  const handleSubmit = (data: ContractorFormValues) => {
    console.log("Form data before submission:", data);
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <ContractorFormFields form={form} />
        <div className="flex justify-end gap-2">
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </Form>
  );
}