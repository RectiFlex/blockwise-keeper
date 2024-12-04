import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ['#8B5CF6', '#D946EF', '#F97316', '#0EA5E9'];

const fetchPropertyDistribution = async () => {
  const { data, error } = await supabase
    .from('property_distribution')
    .select('*');

  if (error) throw error;
  return data;
};

export default function PropertyDistribution() {
  const { data, isLoading } = useQuery({
    queryKey: ['property-distribution'],
    queryFn: fetchPropertyDistribution,
  });

  if (isLoading) return <div>Loading distribution...</div>;

  return (
    <div className="glass card-gradient p-6">
      <h2 className="text-lg font-semibold mb-4">Property Distribution</h2>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="count"
              nameKey="property_type"
              label={({ property_type, percent }) => 
                `${property_type} ${(percent * 100).toFixed(0)}%`
              }
            >
              {data?.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                background: 'rgba(0,0,0,0.8)', 
                border: '1px solid rgba(255,255,255,0.2)' 
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}