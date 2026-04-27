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
      achievements: {
        Row: {
          badge_name: string
          badge_type: string
          description: string | null
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_name: string
          badge_type: string
          description?: string | null
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_name?: string
          badge_type?: string
          description?: string | null
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_history: {
        Row: {
          created_at: string
          id: string
          message: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dietary_preferences: {
        Row: {
          allergies: string[] | null
          budget_range: string | null
          created_at: string
          cuisine_preferences: string[] | null
          diet_type: Database["public"]["Enums"]["diet_type"]
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          allergies?: string[] | null
          budget_range?: string | null
          created_at?: string
          cuisine_preferences?: string[] | null
          diet_type: Database["public"]["Enums"]["diet_type"]
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          allergies?: string[] | null
          budget_range?: string | null
          created_at?: string
          cuisine_preferences?: string[] | null
          diet_type?: Database["public"]["Enums"]["diet_type"]
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dietary_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      health_conditions: {
        Row: {
          condition_name: string
          created_at: string
          id: string
          notes: string | null
          severity: string | null
          user_id: string
        }
        Insert: {
          condition_name: string
          created_at?: string
          id?: string
          notes?: string | null
          severity?: string | null
          user_id: string
        }
        Update: {
          condition_name?: string
          created_at?: string
          id?: string
          notes?: string | null
          severity?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_conditions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      health_goals: {
        Row: {
          created_at: string
          goal_type: Database["public"]["Enums"]["goal_type"]
          id: string
          target_weight_kg: number | null
          timeline_weeks: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          goal_type: Database["public"]["Enums"]["goal_type"]
          id?: string
          target_weight_kg?: number | null
          timeline_weeks?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          goal_type?: Database["public"]["Enums"]["goal_type"]
          id?: string
          target_weight_kg?: number | null
          timeline_weeks?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plans: {
        Row: {
          calories: number | null
          carbs: number | null
          created_at: string
          date: string
          fats: number | null
          id: string
          ingredients: Json | null
          is_completed: boolean
          meal_type: Database["public"]["Enums"]["meal_type"]
          protein: number | null
          recipe_instructions: string | null
          recipe_name: string
          user_id: string
        }
        Insert: {
          calories?: number | null
          carbs?: number | null
          created_at?: string
          date: string
          fats?: number | null
          id?: string
          ingredients?: Json | null
          is_completed?: boolean
          meal_type: Database["public"]["Enums"]["meal_type"]
          protein?: number | null
          recipe_instructions?: string | null
          recipe_name: string
          user_id: string
        }
        Update: {
          calories?: number | null
          carbs?: number | null
          created_at?: string
          date?: string
          fats?: number | null
          id?: string
          ingredients?: Json | null
          is_completed?: boolean
          meal_type?: Database["public"]["Enums"]["meal_type"]
          protein?: number | null
          recipe_instructions?: string | null
          recipe_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_targets: {
        Row: {
          calculated_at: string
          carbs_grams: number
          daily_calories: number
          fats_grams: number
          id: string
          is_active: boolean
          protein_grams: number
          user_id: string
        }
        Insert: {
          calculated_at?: string
          carbs_grams: number
          daily_calories: number
          fats_grams: number
          id?: string
          is_active?: boolean
          protein_grams: number
          user_id: string
        }
        Update: {
          calculated_at?: string
          carbs_grams?: number
          daily_calories?: number
          fats_grams?: number
          id?: string
          is_active?: boolean
          protein_grams?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_targets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          activity_level: Database["public"]["Enums"]["activity_level"] | null
          age: number | null
          created_at: string
          first_name: string | null
          gender: string | null
          height_cm: number | null
          id: string
          last_name: string | null
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          activity_level?: Database["public"]["Enums"]["activity_level"] | null
          age?: number | null
          created_at?: string
          first_name?: string | null
          gender?: string | null
          height_cm?: number | null
          id: string
          last_name?: string | null
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          activity_level?: Database["public"]["Enums"]["activity_level"] | null
          age?: number | null
          created_at?: string
          first_name?: string | null
          gender?: string | null
          height_cm?: number | null
          id?: string
          last_name?: string | null
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      shopping_lists: {
        Row: {
          created_at: string
          estimated_cost: number | null
          id: string
          items: Json
          user_id: string
          week_start_date: string
        }
        Insert: {
          created_at?: string
          estimated_cost?: number | null
          id?: string
          items: Json
          user_id: string
          week_start_date: string
        }
        Update: {
          created_at?: string
          estimated_cost?: number | null
          id?: string
          items?: Json
          user_id?: string
          week_start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_lists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      weight_logs: {
        Row: {
          id: string
          logged_at: string
          notes: string | null
          user_id: string
          weight_kg: number
        }
        Insert: {
          id?: string
          logged_at?: string
          notes?: string | null
          user_id: string
          weight_kg: number
        }
        Update: {
          id?: string
          logged_at?: string
          notes?: string | null
          user_id?: string
          weight_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "weight_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_logs: {
        Row: {
          completed_at: string
          duration_minutes: number | null
          id: string
          notes: string | null
          user_id: string
          workout_id: string | null
        }
        Insert: {
          completed_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          user_id: string
          workout_id?: string | null
        }
        Update: {
          completed_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          user_id?: string
          workout_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_logs_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          condition_tags: string[] | null
          created_at: string
          description: string | null
          difficulty_level: Database["public"]["Enums"]["difficulty_level"]
          duration_minutes: number
          exercise_list: Json
          id: string
          name: string
        }
        Insert: {
          condition_tags?: string[] | null
          created_at?: string
          description?: string | null
          difficulty_level: Database["public"]["Enums"]["difficulty_level"]
          duration_minutes: number
          exercise_list: Json
          id?: string
          name: string
        }
        Update: {
          condition_tags?: string[] | null
          created_at?: string
          description?: string | null
          difficulty_level?: Database["public"]["Enums"]["difficulty_level"]
          duration_minutes?: number
          exercise_list?: Json
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      activity_level:
        | "sedentary"
        | "lightly_active"
        | "moderately_active"
        | "very_active"
        | "extremely_active"
      app_role: "admin" | "user" | "dietitian"
      diet_type: "vegetarian" | "non_vegetarian" | "vegan"
      difficulty_level: "beginner" | "intermediate" | "advanced"
      goal_type: "lose_weight" | "gain_muscle" | "maintain"
      meal_type: "breakfast" | "lunch" | "dinner" | "snack"
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
      activity_level: [
        "sedentary",
        "lightly_active",
        "moderately_active",
        "very_active",
        "extremely_active",
      ],
      app_role: ["admin", "user", "dietitian"],
      diet_type: ["vegetarian", "non_vegetarian", "vegan"],
      difficulty_level: ["beginner", "intermediate", "advanced"],
      goal_type: ["lose_weight", "gain_muscle", "maintain"],
      meal_type: ["breakfast", "lunch", "dinner", "snack"],
    },
  },
} as const
