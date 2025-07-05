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
      agent_behavior_settings: {
        Row: {
          created_at: string
          default_responses: Json | null
          fallback_message: string | null
          id: string
          max_response_length: number | null
          preferred_format: string | null
          prohibited_words: string[] | null
          response_examples: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          default_responses?: Json | null
          fallback_message?: string | null
          id?: string
          max_response_length?: number | null
          preferred_format?: string | null
          prohibited_words?: string[] | null
          response_examples?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          default_responses?: Json | null
          fallback_message?: string | null
          id?: string
          max_response_length?: number | null
          preferred_format?: string | null
          prohibited_words?: string[] | null
          response_examples?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      agent_configurations: {
        Row: {
          agent_description: string | null
          agent_name: string
          created_at: string
          default_language: string
          id: string
          updated_at: string
          user_id: string | null
          voice_tone: string
        }
        Insert: {
          agent_description?: string | null
          agent_name?: string
          created_at?: string
          default_language?: string
          id: string
          updated_at?: string
          user_id?: string | null
          voice_tone?: string
        }
        Update: {
          agent_description?: string | null
          agent_name?: string
          created_at?: string
          default_language?: string
          id?: string
          updated_at?: string
          user_id?: string | null
          voice_tone?: string
        }
        Relationships: []
      }
      agent_conversation_flows: {
        Row: {
          conditions: Json | null
          created_at: string
          escalation_rules: Json | null
          flow_description: string | null
          flow_name: string
          flow_steps: Json
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          conditions?: Json | null
          created_at?: string
          escalation_rules?: Json | null
          flow_description?: string | null
          flow_name: string
          flow_steps?: Json
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          conditions?: Json | null
          created_at?: string
          escalation_rules?: Json | null
          flow_description?: string | null
          flow_name?: string
          flow_steps?: Json
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      agent_conversations: {
        Row: {
          created_at: string
          id: string
          status: Database["public"]["Enums"]["agent_conversation_status"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["agent_conversation_status"]
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["agent_conversation_status"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      agent_manual_contexts: {
        Row: {
          context_content: string
          context_title: string
          created_at: string
          id: string
          status: string
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          context_content: string
          context_title: string
          created_at?: string
          id?: string
          status?: string
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          context_content?: string
          context_title?: string
          created_at?: string
          id?: string
          status?: string
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      agent_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["message_role"]
          webhook_response: Json | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["message_role"]
          webhook_response?: Json | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["message_role"]
          webhook_response?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "agent_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_reference_links: {
        Row: {
          created_at: string
          id: string
          link_description: string | null
          link_title: string
          link_url: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          link_description?: string | null
          link_title: string
          link_url: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          link_description?: string | null
          link_title?: string
          link_url?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      agent_training_data: {
        Row: {
          answer: string
          created_at: string
          id: string
          question: string
          status: Database["public"]["Enums"]["training_data_status"]
          updated_at: string
          user_id: string
          webhook_response: Json | null
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          question: string
          status?: Database["public"]["Enums"]["training_data_status"]
          updated_at?: string
          user_id: string
          webhook_response?: Json | null
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          question?: string
          status?: Database["public"]["Enums"]["training_data_status"]
          updated_at?: string
          user_id?: string
          webhook_response?: Json | null
        }
        Relationships: []
      }
      agent_training_files: {
        Row: {
          created_at: string | null
          file_content: string | null
          file_name: string
          file_type: string
          file_url: string | null
          id: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          file_content?: string | null
          file_name: string
          file_type: string
          file_url?: string | null
          id?: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          file_content?: string | null
          file_name?: string
          file_type?: string
          file_url?: string | null
          id?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      agent_user_feedback: {
        Row: {
          comments: string | null
          conversation_id: string
          created_at: string
          feedback_type: string
          feedback_value: string | null
          id: string
          message_id: string | null
          rating: number | null
          user_id: string | null
        }
        Insert: {
          comments?: string | null
          conversation_id: string
          created_at?: string
          feedback_type: string
          feedback_value?: string | null
          id?: string
          message_id?: string | null
          rating?: number | null
          user_id?: string | null
        }
        Update: {
          comments?: string | null
          conversation_id?: string
          created_at?: string
          feedback_type?: string
          feedback_value?: string | null
          id?: string
          message_id?: string | null
          rating?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_user_feedback_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "agent_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_user_feedback_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "agent_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      business_manager_accounts: {
        Row: {
          access_token: string
          ad_account_id: string | null
          ad_account_name: string | null
          app_id: string | null
          app_secret: string | null
          bm_name: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          ad_account_id?: string | null
          ad_account_name?: string | null
          app_id?: string | null
          app_secret?: string | null
          bm_name: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          ad_account_id?: string | null
          ad_account_name?: string | null
          app_id?: string | null
          app_secret?: string | null
          bm_name?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      creative_insights: {
        Row: {
          ad_id: string | null
          adset_name: string | null
          amount_spent: number | null
          body_rate: number | null
          campaign_id: string | null
          campaign_name: string | null
          clicks: number | null
          cost_per_click: number | null
          cost_per_mille: number | null
          created_at: string | null
          creative_name: string
          cta_rate: number | null
          ctr: number | null
          date_reported: string | null
          hook_rate: number | null
          id: string
          impressions: number | null
          ph_hook_rate: number | null
          status: string | null
          updated_at: string | null
          views_3s: number | null
          views_75_percent: number | null
          views_total: number | null
        }
        Insert: {
          ad_id?: string | null
          adset_name?: string | null
          amount_spent?: number | null
          body_rate?: number | null
          campaign_id?: string | null
          campaign_name?: string | null
          clicks?: number | null
          cost_per_click?: number | null
          cost_per_mille?: number | null
          created_at?: string | null
          creative_name: string
          cta_rate?: number | null
          ctr?: number | null
          date_reported?: string | null
          hook_rate?: number | null
          id?: string
          impressions?: number | null
          ph_hook_rate?: number | null
          status?: string | null
          updated_at?: string | null
          views_3s?: number | null
          views_75_percent?: number | null
          views_total?: number | null
        }
        Update: {
          ad_id?: string | null
          adset_name?: string | null
          amount_spent?: number | null
          body_rate?: number | null
          campaign_id?: string | null
          campaign_name?: string | null
          clicks?: number | null
          cost_per_click?: number | null
          cost_per_mille?: number | null
          created_at?: string | null
          creative_name?: string
          cta_rate?: number | null
          ctr?: number | null
          date_reported?: string | null
          hook_rate?: number | null
          id?: string
          impressions?: number | null
          ph_hook_rate?: number | null
          status?: string | null
          updated_at?: string | null
          views_3s?: number | null
          views_75_percent?: number | null
          views_total?: number | null
        }
        Relationships: []
      }
      creative_sales: {
        Row: {
          affiliate_commission: number | null
          affiliate_id: string | null
          affiliate_name: string | null
          comission_value_coprodutor: number | null
          commission_value_produtor: number | null
          country: string | null
          created_at: string | null
          creative_name: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          discount_value: number | null
          gross_value: number | null
          id: string
          is_affiliate: boolean | null
          net_value: number | null
          order_id: string
          payment_method: string
          sale_date: string | null
          state: string | null
          status: string
          tags: string[] | null
          tax_value: number | null
          updated_at: string | null
        }
        Insert: {
          affiliate_commission?: number | null
          affiliate_id?: string | null
          affiliate_name?: string | null
          comission_value_coprodutor?: number | null
          commission_value_produtor?: number | null
          country?: string | null
          created_at?: string | null
          creative_name: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          discount_value?: number | null
          gross_value?: number | null
          id?: string
          is_affiliate?: boolean | null
          net_value?: number | null
          order_id: string
          payment_method: string
          sale_date?: string | null
          state?: string | null
          status?: string
          tags?: string[] | null
          tax_value?: number | null
          updated_at?: string | null
        }
        Update: {
          affiliate_commission?: number | null
          affiliate_id?: string | null
          affiliate_name?: string | null
          comission_value_coprodutor?: number | null
          commission_value_produtor?: number | null
          country?: string | null
          created_at?: string | null
          creative_name?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          discount_value?: number | null
          gross_value?: number | null
          id?: string
          is_affiliate?: boolean | null
          net_value?: number | null
          order_id?: string
          payment_method?: string
          sale_date?: string | null
          state?: string | null
          status?: string
          tags?: string[] | null
          tax_value?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      product_sales: {
        Row: {
          created_at: string
          id: string
          is_subscription: boolean | null
          order_id: string
          product_id: string
          product_name: string
          sale_date: string
          sale_value: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_subscription?: boolean | null
          order_id: string
          product_id: string
          product_name: string
          sale_date?: string
          sale_value?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_subscription?: boolean | null
          order_id?: string
          product_id?: string
          product_name?: string
          sale_date?: string
          sale_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      subscription_events: {
        Row: {
          amount: number
          cartpanda_event_id: string | null
          created_at: string
          currency: string
          customer_email: string
          customer_id: string
          customer_name: string | null
          event_date: string
          event_type: string
          frequency: string | null
          id: string
          metadata: Json | null
          payment_method: string | null
          plan: string
          subscription_id: string
          subscription_number: number | null
          updated_at: string
        }
        Insert: {
          amount?: number
          cartpanda_event_id?: string | null
          created_at?: string
          currency?: string
          customer_email: string
          customer_id: string
          customer_name?: string | null
          event_date?: string
          event_type: string
          frequency?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          plan: string
          subscription_id: string
          subscription_number?: number | null
          updated_at?: string
        }
        Update: {
          amount?: number
          cartpanda_event_id?: string | null
          created_at?: string
          currency?: string
          customer_email?: string
          customer_id?: string
          customer_name?: string | null
          event_date?: string
          event_type?: string
          frequency?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          plan?: string
          subscription_id?: string
          subscription_number?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      subscription_renewals: {
        Row: {
          amount: number
          canceled_at: string | null
          created_at: string
          currency: string
          customer_email: string | null
          customer_id: string | null
          customer_name: string | null
          frequency: string | null
          id: string
          plan: string
          subscription_id: string | null
          subscription_number: number | null
          subscription_status: string
          updated_at: string
        }
        Insert: {
          amount?: number
          canceled_at?: string | null
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string | null
          frequency?: string | null
          id?: string
          plan: string
          subscription_id?: string | null
          subscription_number?: number | null
          subscription_status: string
          updated_at?: string
        }
        Update: {
          amount?: number
          canceled_at?: string | null
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string | null
          frequency?: string | null
          id?: string
          plan?: string
          subscription_id?: string | null
          subscription_number?: number | null
          subscription_status?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscription_status: {
        Row: {
          amount: number
          canceled_at: string | null
          created_at: string
          currency: string
          customer_email: string | null
          customer_id: string | null
          customer_name: string | null
          frequency: string | null
          id: string
          plan: string
          subscription_id: string | null
          subscription_number: number | null
          subscription_status: string
          updated_at: string
        }
        Insert: {
          amount?: number
          canceled_at?: string | null
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string | null
          frequency?: string | null
          id?: string
          plan: string
          subscription_id?: string | null
          subscription_number?: number | null
          subscription_status: string
          updated_at?: string
        }
        Update: {
          amount?: number
          canceled_at?: string | null
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string | null
          frequency?: string | null
          id?: string
          plan?: string
          subscription_id?: string | null
          subscription_number?: number | null
          subscription_status?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_page_permissions: {
        Row: {
          can_access: boolean | null
          id: string
          page: Database["public"]["Enums"]["page"]
          user_id: string
        }
        Insert: {
          can_access?: boolean | null
          id?: string
          page: Database["public"]["Enums"]["page"]
          user_id: string
        }
        Update: {
          can_access?: boolean | null
          id?: string
          page?: Database["public"]["Enums"]["page"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_page_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      agent_conversation_status: "active" | "archived" | "closed"
      app_role: "user" | "admin" | "manager" | "business_manager"
      message_role: "user" | "assistant" | "system"
      page:
        | "dashboard"
        | "settings"
        | "analytics"
        | "billing"
        | "creatives"
        | "sales"
        | "affiliates"
        | "revenue"
        | "users"
        | "business-managers"
        | "subscriptions"
      training_data_status: "pending" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      agent_conversation_status: ["active", "archived", "closed"],
      app_role: ["user", "admin", "manager", "business_manager"],
      message_role: ["user", "assistant", "system"],
      page: [
        "dashboard",
        "settings",
        "analytics",
        "billing",
        "creatives",
        "sales",
        "affiliates",
        "revenue",
        "users",
        "business-managers",
        "subscriptions",
      ],
      training_data_status: ["pending", "approved", "rejected"],
    },
  },
} as const
