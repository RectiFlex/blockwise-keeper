import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const fetchMaintenanceTrends = async () => {
  const { data, error } = await supabase
    .from('monthly_maintenance_trends')
    .select('*')
    .order('month', { ascending: true });

  if (error) throw error;
  return data.map(item => ({
    ...item,
    month: new Date(item.month).toLocaleString('default', { month: 'short' }),
  }));
};

export default function MaintenanceTrends() {
  const { data, isLoading } = useQuery({
    queryKey: ['maintenance-trends'],
    queryFn: fetchMaintenanceTrends,
  });

  if (isLoading) return <div>Loading trends...</div>;

  return (
    <div className="glass card-gradient p-6">
      <h2 className="text-lg font-semibold mb-4">Maintenance Trends</h2>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
            <YAxis stroke="rgba(255,255,255,0.5)" />
            <Tooltip 
              contentStyle={{ 
                background: 'rgba(0,0,0,0.8)', 
                border: '1px solid rgba(255,255,255,0.2)' 
              }} 
            />
            <Line 
              type="monotone" 
              dataKey="request_count" 
              stroke="#8B5CF6" 
              strokeWidth={2}
              dot={{ fill: '#8B5CF6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}