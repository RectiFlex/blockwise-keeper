export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      contractors: {
        Row: {
          company_name: string | null
          created_at: string
          email: string
          hourly_rate: number | null
          id: string
          name: string
          phone: string | null
          specialties: string[] | null
          status: string | null
          updated_at: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          email: string
          hourly_rate?: number | null
          id?: string
          name: string
          phone?: string | null
          specialties?: string[] | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          email?: string
          hourly_rate?: number | null
          id?: string
          name?: string
          phone?: string | null
          specialties?: string[] | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      maintenance_requests: {
        Row: {
          created_at: string
          description: string
          id: string
          priority: string
          property_id: string
          requester_id: string
          status: Database["public"]["Enums"]["maintenance_status"] | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          priority?: string
          property_id: string
          requester_id: string
          status?: Database["public"]["Enums"]["maintenance_status"] | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          priority?: string
          property_id?: string
          requester_id?: string
          status?: Database["public"]["Enums"]["maintenance_status"] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          address: string
          created_at: string
          id: string
          owner_id: string
          smart_contract_address: string | null
          title: string
          updated_at: string
        }
        Insert: {
          address: string
          created_at?: string
          id?: string
          owner_id: string
          smart_contract_address?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          address?: string
          created_at?: string
          id?: string
          owner_id?: string
          smart_contract_address?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      reports_settings: {
        Row: {
          created_at: string
          id: string
          report_type: string
          settings: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          report_type: string
          settings?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          report_type?: string
          settings?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          id: string
          notification_preferences: Json | null
          theme_preferences: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notification_preferences?: Json | null
          theme_preferences?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notification_preferences?: Json | null
          theme_preferences?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      warranties: {
        Row: {
          created_at: string
          description: string | null
          end_date: string
          id: string
          property_id: string
          start_date: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date: string
          id?: string
          property_id: string
          start_date: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string
          id?: string
          property_id?: string
          start_date?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "warranties_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      work_orders: {
        Row: {
          actual_cost: number | null
          completed_date: string | null
          contractor_id: string | null
          created_at: string
          estimated_cost: number | null
          id: string
          maintenance_request_id: string
          notes: string | null
          scheduled_date: string | null
          status: Database["public"]["Enums"]["maintenance_status"] | null
          updated_at: string
        }
        Insert: {
          actual_cost?: number | null
          completed_date?: string | null
          contractor_id?: string | null
          created_at?: string
          estimated_cost?: number | null
          id?: string
          maintenance_request_id: string
          notes?: string | null
          scheduled_date?: string | null
          status?: Database["public"]["Enums"]["maintenance_status"] | null
          updated_at?: string
        }
        Update: {
          actual_cost?: number | null
          completed_date?: string | null
          contractor_id?: string | null
          created_at?: string
          estimated_cost?: number | null
          id?: string
          maintenance_request_id?: string
          notes?: string | null
          scheduled_date?: string | null
          status?: Database["public"]["Enums"]["maintenance_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_orders_maintenance_request_id_fkey"
            columns: ["maintenance_request_id"]
            isOneToOne: false
            referencedRelation: "maintenance_requests"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      maintenance_status: "pending" | "in_progress" | "completed" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
