export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      campaign_classes: {
        Row: {
          campaign_id: string
          class_id: string
          created_at: string | null
          id: string
        }
        Insert: {
          campaign_id: string
          class_id: string
          created_at?: string | null
          id?: string
        }
        Update: {
          campaign_id?: string
          class_id?: string
          created_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_classes_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_classes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_participations: {
        Row: {
          campaign_id: string
          class_id: string
          confirmed_at: string | null
          confirmed_by: string | null
          expires_at: string | null
          id: string
          joined_at: string | null
          status: string
          student_id: string
        }
        Insert: {
          campaign_id: string
          class_id: string
          confirmed_at?: string | null
          confirmed_by?: string | null
          expires_at?: string | null
          id?: string
          joined_at?: string | null
          status?: string
          student_id: string
        }
        Update: {
          campaign_id?: string
          class_id?: string
          confirmed_at?: string | null
          confirmed_by?: string | null
          expires_at?: string | null
          id?: string
          joined_at?: string | null
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_participations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          active: boolean | null
          available_from: string | null
          available_until: string | null
          campaign_type: string
          class_id: string
          created_at: string | null
          created_by: string
          description: string | null
          duration_days: number | null
          duration_type: string | null
          id: string
          image_url: string | null
          multiplier_value: number | null
          points_value: number | null
          title: string
        }
        Insert: {
          active?: boolean | null
          available_from?: string | null
          available_until?: string | null
          campaign_type: string
          class_id: string
          created_at?: string | null
          created_by: string
          description?: string | null
          duration_days?: number | null
          duration_type?: string | null
          id?: string
          image_url?: string | null
          multiplier_value?: number | null
          points_value?: number | null
          title: string
        }
        Update: {
          active?: boolean | null
          available_from?: string | null
          available_until?: string | null
          campaign_type?: string
          class_id?: string
          created_at?: string | null
          created_by?: string
          description?: string | null
          duration_days?: number | null
          duration_type?: string | null
          id?: string
          image_url?: string | null
          multiplier_value?: number | null
          points_value?: number | null
          title?: string
        }
        Relationships: []
      }
      class_members: {
        Row: {
          class_id: string
          id: string
          is_teacher: boolean | null
          joined_at: string | null
          user_id: string
        }
        Insert: {
          class_id: string
          id?: string
          is_teacher?: boolean | null
          joined_at?: string | null
          user_id: string
        }
        Update: {
          class_id?: string
          id?: string
          is_teacher?: boolean | null
          joined_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_members_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          code: string
          created_at: string | null
          id: string
          mentor_id: string
          name: string
          school_id: string
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          mentor_id: string
          name: string
          school_id: string
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          mentor_id?: string
          name?: string
          school_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      default_point_reasons: {
        Row: {
          created_at: string | null
          id: string
          points: number
          reason: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          points: number
          reason: string
        }
        Update: {
          created_at?: string | null
          id?: string
          points?: number
          reason?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          class_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          message_type: string
          reward_purchase_id: string | null
          student_id: string
          teacher_id: string
        }
        Insert: {
          class_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          message_type: string
          reward_purchase_id?: string | null
          student_id: string
          teacher_id: string
        }
        Update: {
          class_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          message_type?: string
          reward_purchase_id?: string | null
          student_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_reward_purchase_id_fkey"
            columns: ["reward_purchase_id"]
            isOneToOne: false
            referencedRelation: "reward_purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      points_transactions: {
        Row: {
          class_id: string
          created_at: string | null
          id: string
          points: number
          reason: string
          student_id: string
          teacher_id: string
        }
        Insert: {
          class_id: string
          created_at?: string | null
          id?: string
          points: number
          reason: string
          student_id: string
          teacher_id: string
        }
        Update: {
          class_id?: string
          created_at?: string | null
          id?: string
          points?: number
          reason?: string
          student_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "points_transactions_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      reward_classes: {
        Row: {
          class_id: string
          created_at: string | null
          id: string
          reward_id: string
        }
        Insert: {
          class_id: string
          created_at?: string | null
          id?: string
          reward_id: string
        }
        Update: {
          class_id?: string
          created_at?: string | null
          id?: string
          reward_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_classes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_classes_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_purchases: {
        Row: {
          class_id: string
          expires_at: string | null
          fulfilled_at: string | null
          fulfilled_by: string | null
          id: string
          purchased_at: string | null
          reward_id: string
          status: string
          student_id: string
        }
        Insert: {
          class_id: string
          expires_at?: string | null
          fulfilled_at?: string | null
          fulfilled_by?: string | null
          id?: string
          purchased_at?: string | null
          reward_id: string
          status?: string
          student_id: string
        }
        Update: {
          class_id?: string
          expires_at?: string | null
          fulfilled_at?: string | null
          fulfilled_by?: string | null
          id?: string
          purchased_at?: string | null
          reward_id?: string
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_purchases_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_purchases_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          active: boolean | null
          available_from: string | null
          available_until: string | null
          category: string
          class_id: string
          created_at: string | null
          created_by: string
          description: string | null
          duration_days: number | null
          duration_type: string | null
          id: string
          image_url: string | null
          points_cost: number
          purchase_limit_count: number | null
          purchase_limit_type: string | null
          reward_type: string
          title: string
        }
        Insert: {
          active?: boolean | null
          available_from?: string | null
          available_until?: string | null
          category: string
          class_id: string
          created_at?: string | null
          created_by: string
          description?: string | null
          duration_days?: number | null
          duration_type?: string | null
          id?: string
          image_url?: string | null
          points_cost: number
          purchase_limit_count?: number | null
          purchase_limit_type?: string | null
          reward_type: string
          title: string
        }
        Update: {
          active?: boolean | null
          available_from?: string | null
          available_until?: string | null
          category?: string
          class_id?: string
          created_at?: string | null
          created_by?: string
          description?: string | null
          duration_days?: number | null
          duration_type?: string | null
          id?: string
          image_url?: string | null
          points_cost?: number
          purchase_limit_count?: number | null
          purchase_limit_type?: string | null
          reward_type?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "rewards_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          code: string
          created_at: string | null
          created_by: string
          id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string | null
          created_by: string
          id?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string | null
          created_by?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          school_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          school_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          school_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_class_code: { Args: never; Returns: string }
      generate_school_code: { Args: never; Returns: string }
      get_user_school: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_class_member: {
        Args: { _class_id: string; _user_id: string }
        Returns: boolean
      }
      is_class_mentor: {
        Args: { _class_id: string; _user_id: string }
        Returns: boolean
      }
      is_developer: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "teacher" | "student" | "developer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["teacher", "student", "developer"],
    },
  },
} as const
