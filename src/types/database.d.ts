import { Database as GeneratedDatabase } from '@/integrations/supabase/types';

export type Database = GeneratedDatabase;

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// Add more specific types as needed
export type Property = Tables<'properties'> & {
  maintenance_requests?: { count: number }[];
};

export type MaintenanceRequest = Tables<'maintenance_requests'> & {
  work_orders?: { actual_cost: number }[];
};