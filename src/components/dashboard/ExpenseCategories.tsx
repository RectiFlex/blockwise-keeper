import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from "recharts";

const COLORS = ['#8B5CF6', '#D946EF', '#F97316', '#0EA5E9'];

const fetchExpenseCategories = async () => {
  const { data, error } = await supabase
    .from('expense_categories')
    .select('*');

  if (error) throw error;
  return data;
};

export default function ExpenseCategories() {
  const { data, isLoading } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: fetchExpenseCategories,
  });

  if (isLoading) return <div>Loading expenses...</div>;

  return (
    <div className="glass card-gradient p-6">
      <h2 className="text-lg font-semibold mb-4">Expenses by Category</h2>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="category" stroke="rgba(255,255,255,0.5)" />
            <YAxis stroke="rgba(255,255,255,0.5)" />
            <Tooltip 
              contentStyle={{ 
                background: 'rgba(0,0,0,0.8)', 
                border: '1px solid rgba(255,255,255,0.2)' 
              }}
            />
            <Bar dataKey="amount">
              {data?.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}