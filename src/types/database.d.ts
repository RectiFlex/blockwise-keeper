import { Database as GeneratedDatabase } from '@/integrations/supabase/types';

export type Database = GeneratedDatabase;

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// Specific table types
export type Property = Tables<'properties'> & {
  maintenance_requests?: { count: number }[];
};

export type MaintenanceRequest = Tables<'maintenance_requests'> & {
  work_orders?: WorkOrder[];
  properties?: Property;
};

export type WorkOrder = Tables<'work_orders'> & {
  maintenance_request?: MaintenanceRequest;
  contractor?: Contractor;
};

export type Contractor = Tables<'contractors'>;

export type Warranty = Tables<'warranties'>;