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
          category: string
          created_at: string
          description: string
          icon: string
          id: string
          name: string
          points: number
          requirement_type: string
          requirement_value: number
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          icon: string
          id?: string
          name: string
          points?: number
          requirement_type: string
          requirement_value?: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          points?: number
          requirement_type?: string
          requirement_value?: number
        }
        Relationships: []
      }
      incident_activity: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json | null
          id: string
          incident_id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          incident_id: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          incident_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "incident_activity_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_notes: {
        Row: {
          author_id: string | null
          created_at: string
          id: string
          incident_id: string
          note: string
        }
        Insert: {
          author_id?: string | null
          created_at?: string
          id?: string
          incident_id: string
          note: string
        }
        Update: {
          author_id?: string | null
          created_at?: string
          id?: string
          incident_id?: string
          note?: string
        }
        Relationships: [
          {
            foreignKeyName: "incident_notes_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          assigned_analyst: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          severity: string
          status: string
          team_id: string | null
          threat_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_analyst?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          severity?: string
          status?: string
          team_id?: string | null
          threat_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_analyst?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          severity?: string
          status?: string
          team_id?: string | null
          threat_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "incidents_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "security_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_threat_id_fkey"
            columns: ["threat_id"]
            isOneToOne: false
            referencedRelation: "threat_indicators"
            referencedColumns: ["id"]
          },
        ]
      }
      intelligence_sync_logs: {
        Row: {
          created_at: string
          id: string
          message: string | null
          provider: string
          records_imported: number
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          provider: string
          records_imported?: number
          status: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          provider?: string
          records_imported?: number
          status?: string
        }
        Relationships: []
      }
      knowledge_base: {
        Row: {
          category: string
          created_at: string
          embedding: string | null
          id: string
          prompt: string
        }
        Insert: {
          category: string
          created_at?: string
          embedding?: string | null
          id?: string
          prompt: string
        }
        Update: {
          category?: string
          created_at?: string
          embedding?: string | null
          id?: string
          prompt?: string
        }
        Relationships: []
      }
      lab_progress: {
        Row: {
          completed_at: string
          id: string
          lab_id: string
          lab_type: string
          points_earned: number
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          lab_id: string
          lab_type: string
          points_earned?: number
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          lab_id?: string
          lab_type?: string
          points_earned?: number
          user_id?: string
        }
        Relationships: []
      }
      leaderboard: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          points: number
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          points?: number
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          points?: number
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      profile_views: {
        Row: {
          id: string
          profile_user_id: string
          viewed_at: string
          viewer_id: string | null
        }
        Insert: {
          id?: string
          profile_user_id: string
          viewed_at?: string
          viewer_id?: string | null
        }
        Update: {
          id?: string
          profile_user_id?: string
          viewed_at?: string
          viewer_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          ai_tutor_avatar: Json | null
          ai_tutor_name: string | null
          avatar_url: string | null
          certifications: string[] | null
          created_at: string
          id: string
          interests: string[] | null
          is_public: boolean | null
          location: string | null
          points: number
          skills: string[] | null
          social_links: Json | null
          summary: string | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          ai_tutor_avatar?: Json | null
          ai_tutor_name?: string | null
          avatar_url?: string | null
          certifications?: string[] | null
          created_at?: string
          id?: string
          interests?: string[] | null
          is_public?: boolean | null
          location?: string | null
          points?: number
          skills?: string[] | null
          social_links?: Json | null
          summary?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          ai_tutor_avatar?: Json | null
          ai_tutor_name?: string | null
          avatar_url?: string | null
          certifications?: string[] | null
          created_at?: string
          id?: string
          interests?: string[] | null
          is_public?: boolean | null
          location?: string | null
          points?: number
          skills?: string[] | null
          social_links?: Json | null
          summary?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      security_teams: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      threat_flags: {
        Row: {
          created_at: string
          flagged_by: string
          id: string
          reason: string | null
          threat_id: string
        }
        Insert: {
          created_at?: string
          flagged_by: string
          id?: string
          reason?: string | null
          threat_id: string
        }
        Update: {
          created_at?: string
          flagged_by?: string
          id?: string
          reason?: string | null
          threat_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "threat_flags_threat_id_fkey"
            columns: ["threat_id"]
            isOneToOne: false
            referencedRelation: "threat_indicators"
            referencedColumns: ["id"]
          },
        ]
      }
      threat_geo_cache: {
        Row: {
          city: string | null
          country: string | null
          fetched_at: string
          ip: string
          latitude: number | null
          longitude: number | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          fetched_at?: string
          ip: string
          latitude?: number | null
          longitude?: number | null
        }
        Update: {
          city?: string | null
          country?: string | null
          fetched_at?: string
          ip?: string
          latitude?: number | null
          longitude?: number | null
        }
        Relationships: []
      }
      threat_indicators: {
        Row: {
          city: string | null
          confidence: number | null
          country: string | null
          created_at: string
          dest_ip: string | null
          dest_latitude: number | null
          dest_longitude: number | null
          dest_port: number | null
          first_seen: string | null
          flagged_at: string | null
          flagged_by: string | null
          id: string
          incident_id: string | null
          indicator_value: string
          is_flagged: boolean
          last_seen: string | null
          latitude: number | null
          longitude: number | null
          malware_family: string | null
          protocol: string | null
          provider: string
          provider_event_id: string
          severity: string
          source_ip: string | null
          source_reference: string | null
          threat_type: string
          updated_at: string
        }
        Insert: {
          city?: string | null
          confidence?: number | null
          country?: string | null
          created_at?: string
          dest_ip?: string | null
          dest_latitude?: number | null
          dest_longitude?: number | null
          dest_port?: number | null
          first_seen?: string | null
          flagged_at?: string | null
          flagged_by?: string | null
          id?: string
          incident_id?: string | null
          indicator_value: string
          is_flagged?: boolean
          last_seen?: string | null
          latitude?: number | null
          longitude?: number | null
          malware_family?: string | null
          protocol?: string | null
          provider: string
          provider_event_id: string
          severity?: string
          source_ip?: string | null
          source_reference?: string | null
          threat_type: string
          updated_at?: string
        }
        Update: {
          city?: string | null
          confidence?: number | null
          country?: string | null
          created_at?: string
          dest_ip?: string | null
          dest_latitude?: number | null
          dest_longitude?: number | null
          dest_port?: number | null
          first_seen?: string | null
          flagged_at?: string | null
          flagged_by?: string | null
          id?: string
          incident_id?: string | null
          indicator_value?: string
          is_flagged?: boolean
          last_seen?: string | null
          latitude?: number | null
          longitude?: number | null
          malware_family?: string | null
          protocol?: string | null
          provider?: string
          provider_event_id?: string
          severity?: string
          source_ip?: string | null
          source_reference?: string | null
          threat_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_threat_incident"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
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
          role: Database["public"]["Enums"]["app_role"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_user_points: { Args: { _points: number }; Returns: undefined }
      award_achievement: { Args: { _achievement_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      match_knowledge: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          category: string
          id: string
          prompt: string
          similarity: number
        }[]
      }
      toggle_threat_flag: {
        Args: { _reason?: string; _threat_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
