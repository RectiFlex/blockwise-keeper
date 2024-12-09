import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Database } from '@/integrations/supabase/types';

type WorkOrder = Database['public']['Tables']['work_orders']['Row'];
type MaintenanceRequest = Database['public']['Tables']['maintenance_requests']['Row'];
type Contractor = Database['public']['Tables']['contractors']['Row'];

interface WorkOrderPDFProps {
  workOrder: WorkOrder;
  request: MaintenanceRequest;
  contractor: Contractor | null;
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  text: {
    fontSize: 12,
    marginBottom: 3,
  },
  label: {
    fontSize: 10,
    color: '#666',
  },
  value: {
    fontSize: 12,
    marginBottom: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#666',
  },
});

export function WorkOrderPDF({ workOrder, request, contractor }: WorkOrderPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Work Order #{workOrder.id}</Text>
          <Text style={styles.text}>Created: {new Date(workOrder.created_at).toLocaleDateString()}</Text>
          <Text style={styles.text}>Status: {workOrder.status}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Maintenance Request Details</Text>
          <Text style={styles.text}>Title: {request.title}</Text>
          <Text style={styles.text}>Description: {request.description}</Text>
          <Text style={styles.text}>Priority: {request.priority}</Text>
        </View>

        {contractor && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contractor Information</Text>
            <Text style={styles.text}>Name: {contractor.name}</Text>
            <Text style={styles.text}>Email: {contractor.email}</Text>
            {contractor.phone && (
              <Text style={styles.text}>Phone: {contractor.phone}</Text>
            )}
            {contractor.specialties && (
              <Text style={styles.text}>
                Specialties: {contractor.specialties.join(", ")}
              </Text>
            )}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Work Order Details</Text>
          {workOrder.scheduled_date && (
            <Text style={styles.text}>
              Scheduled Date: {new Date(workOrder.scheduled_date).toLocaleDateString()}
            </Text>
          )}
          {workOrder.estimated_cost && (
            <Text style={styles.text}>
              Estimated Cost: ${workOrder.estimated_cost.toFixed(2)}
            </Text>
          )}
          {workOrder.actual_cost && (
            <Text style={styles.text}>
              Actual Cost: ${workOrder.actual_cost.toFixed(2)}
            </Text>
          )}
          {workOrder.notes && (
            <View>
              <Text style={styles.label}>Notes:</Text>
              <Text style={styles.value}>{workOrder.notes}</Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text>Generated on {new Date().toLocaleString()}</Text>
        </View>
      </Page>
    </Document>
  );
}