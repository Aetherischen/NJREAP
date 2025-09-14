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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_settings: {
        Row: {
          created_at: string
          email_alerts: boolean
          id: number
          new_job_alerts: boolean
          notification_emails: string[]
          payment_alerts: boolean
          sms_alerts: boolean
          updated_at: string
          weekly_reports_enabled: boolean
        }
        Insert: {
          created_at?: string
          email_alerts?: boolean
          id?: number
          new_job_alerts?: boolean
          notification_emails?: string[]
          payment_alerts?: boolean
          sms_alerts?: boolean
          updated_at?: string
          weekly_reports_enabled?: boolean
        }
        Update: {
          created_at?: string
          email_alerts?: boolean
          id?: number
          new_job_alerts?: boolean
          notification_emails?: string[]
          payment_alerts?: boolean
          sms_alerts?: boolean
          updated_at?: string
          weekly_reports_enabled?: boolean
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          page_path: string | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          page_path?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          page_path?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      appraisal_list: {
        Row: {
          address_client: string | null
          address_institution: string | null
          address_subject: string | null
          client: string | null
          cost: number | null
          created_at: string
          date_effective: string | null
          date_inspection: string | null
          date_requested: string | null
          file_number: string | null
          id: number
          intended_user_1: string | null
          intended_user_2: string | null
          intended_user_additional: string | null
          lender: boolean | null
          purpose: string | null
        }
        Insert: {
          address_client?: string | null
          address_institution?: string | null
          address_subject?: string | null
          client?: string | null
          cost?: number | null
          created_at?: string
          date_effective?: string | null
          date_inspection?: string | null
          date_requested?: string | null
          file_number?: string | null
          id?: number
          intended_user_1?: string | null
          intended_user_2?: string | null
          intended_user_additional?: string | null
          lender?: boolean | null
          purpose?: string | null
        }
        Update: {
          address_client?: string | null
          address_institution?: string | null
          address_subject?: string | null
          client?: string | null
          cost?: number | null
          created_at?: string
          date_effective?: string | null
          date_inspection?: string | null
          date_requested?: string | null
          file_number?: string | null
          id?: number
          intended_user_1?: string | null
          intended_user_2?: string | null
          intended_user_additional?: string | null
          lender?: boolean | null
          purpose?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string
          category: string
          content: string
          created_at: string
          excerpt: string | null
          featured_image: string | null
          id: string
          published: boolean | null
          read_time: number | null
          slug: string
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          author_id: string
          category: string
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published?: boolean | null
          read_time?: number | null
          slug: string
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          author_id?: string
          category?: string
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published?: boolean | null
          read_time?: number | null
          slug?: string
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          subscribed_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      discount_codes: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          type: string
          updated_at: string
          value: number
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          type: string
          updated_at?: string
          value: number
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          type?: string
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      gallery_collections: {
        Row: {
          cover_image: string | null
          created_at: string
          description: string | null
          featured: boolean | null
          id: string
          location: string | null
          media_items: Json | null
          property_type: string | null
          service_type: Database["public"]["Enums"]["service_type"] | null
          title: string
          updated_at: string
        }
        Insert: {
          cover_image?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean | null
          id?: string
          location?: string | null
          media_items?: Json | null
          property_type?: string | null
          service_type?: Database["public"]["Enums"]["service_type"] | null
          title: string
          updated_at?: string
        }
        Update: {
          cover_image?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean | null
          id?: string
          location?: string | null
          media_items?: Json | null
          property_type?: string | null
          service_type?: Database["public"]["Enums"]["service_type"] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          alt_text: string | null
          collection_id: string | null
          created_at: string
          id: string
          image_url: string
          order_index: number | null
        }
        Insert: {
          alt_text?: string | null
          collection_id?: string | null
          created_at?: string
          id?: string
          image_url: string
          order_index?: number | null
        }
        Update: {
          alt_text?: string | null
          collection_id?: string | null
          created_at?: string
          id?: string
          image_url?: string
          order_index?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "gallery_images_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "gallery_collections"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          client_email: string
          client_name: string
          client_phone: string | null
          completed_date: string | null
          created_at: string
          description: string | null
          final_amount: number | null
          id: string
          invoice_amount: number | null
          invoice_paid_at: string | null
          invoice_sent_at: string | null
          invoice_status: string | null
          property_address: string
          quoted_amount: number | null
          raw_njpr_data: string | null
          referral_other_description: string | null
          referral_source: string | null
          scheduled_date: string | null
          service_type: Database["public"]["Enums"]["service_type"]
          status: Database["public"]["Enums"]["job_status"]
          stripe_customer_id: string | null
          stripe_invoice_id: string | null
          updated_at: string
        }
        Insert: {
          client_email: string
          client_name: string
          client_phone?: string | null
          completed_date?: string | null
          created_at?: string
          description?: string | null
          final_amount?: number | null
          id?: string
          invoice_amount?: number | null
          invoice_paid_at?: string | null
          invoice_sent_at?: string | null
          invoice_status?: string | null
          property_address: string
          quoted_amount?: number | null
          raw_njpr_data?: string | null
          referral_other_description?: string | null
          referral_source?: string | null
          scheduled_date?: string | null
          service_type: Database["public"]["Enums"]["service_type"]
          status?: Database["public"]["Enums"]["job_status"]
          stripe_customer_id?: string | null
          stripe_invoice_id?: string | null
          updated_at?: string
        }
        Update: {
          client_email?: string
          client_name?: string
          client_phone?: string | null
          completed_date?: string | null
          created_at?: string
          description?: string | null
          final_amount?: number | null
          id?: string
          invoice_amount?: number | null
          invoice_paid_at?: string | null
          invoice_sent_at?: string | null
          invoice_status?: string | null
          property_address?: string
          quoted_amount?: number | null
          raw_njpr_data?: string | null
          referral_other_description?: string | null
          referral_source?: string | null
          scheduled_date?: string | null
          service_type?: Database["public"]["Enums"]["service_type"]
          status?: Database["public"]["Enums"]["job_status"]
          stripe_customer_id?: string | null
          stripe_invoice_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          role: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      property_listings: {
        Row: {
          acreage: number | null
          aerial_urls: string[] | null
          agent_email: string | null
          agent_facebook: string | null
          agent_headshot_url: string | null
          agent_instagram: string | null
          agent_linkedin: string | null
          agent_name: string
          agent_phone: string | null
          agent_pinterest: string | null
          agent_x: string | null
          agent_youtube: string | null
          bathrooms: number | null
          bedrooms: number | null
          block: string | null
          brokerage_logo_url: string | null
          brokerage_name: string | null
          created_at: string
          floorplan_image_urls: string[] | null
          floorplan_pdf_urls: string[] | null
          floorplan_urls: string[] | null
          has_aerial: boolean
          has_floorplans: boolean
          has_matterport: boolean
          has_photos: boolean
          has_videos: boolean
          id: string
          is_public: boolean
          lot: string | null
          matterport_urls: string[] | null
          photos_urls: string[] | null
          primary_photo_url: string | null
          primary_photos_urls: string[] | null
          property_address: string
          property_city: string | null
          property_state: string | null
          property_zip: string | null
          qual: string | null
          slug: string | null
          sqft: number | null
          tax_assessment: number | null
          tax_assessment_year: number | null
          updated_at: string
          video_urls: string[] | null
          year_built: number | null
        }
        Insert: {
          acreage?: number | null
          aerial_urls?: string[] | null
          agent_email?: string | null
          agent_facebook?: string | null
          agent_headshot_url?: string | null
          agent_instagram?: string | null
          agent_linkedin?: string | null
          agent_name: string
          agent_phone?: string | null
          agent_pinterest?: string | null
          agent_x?: string | null
          agent_youtube?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          block?: string | null
          brokerage_logo_url?: string | null
          brokerage_name?: string | null
          created_at?: string
          floorplan_image_urls?: string[] | null
          floorplan_pdf_urls?: string[] | null
          floorplan_urls?: string[] | null
          has_aerial?: boolean
          has_floorplans?: boolean
          has_matterport?: boolean
          has_photos?: boolean
          has_videos?: boolean
          id?: string
          is_public?: boolean
          lot?: string | null
          matterport_urls?: string[] | null
          photos_urls?: string[] | null
          primary_photo_url?: string | null
          primary_photos_urls?: string[] | null
          property_address: string
          property_city?: string | null
          property_state?: string | null
          property_zip?: string | null
          qual?: string | null
          slug?: string | null
          sqft?: number | null
          tax_assessment?: number | null
          tax_assessment_year?: number | null
          updated_at?: string
          video_urls?: string[] | null
          year_built?: number | null
        }
        Update: {
          acreage?: number | null
          aerial_urls?: string[] | null
          agent_email?: string | null
          agent_facebook?: string | null
          agent_headshot_url?: string | null
          agent_instagram?: string | null
          agent_linkedin?: string | null
          agent_name?: string
          agent_phone?: string | null
          agent_pinterest?: string | null
          agent_x?: string | null
          agent_youtube?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          block?: string | null
          brokerage_logo_url?: string | null
          brokerage_name?: string | null
          created_at?: string
          floorplan_image_urls?: string[] | null
          floorplan_pdf_urls?: string[] | null
          floorplan_urls?: string[] | null
          has_aerial?: boolean
          has_floorplans?: boolean
          has_matterport?: boolean
          has_photos?: boolean
          has_videos?: boolean
          id?: string
          is_public?: boolean
          lot?: string | null
          matterport_urls?: string[] | null
          photos_urls?: string[] | null
          primary_photo_url?: string | null
          primary_photos_urls?: string[] | null
          property_address?: string
          property_city?: string | null
          property_state?: string | null
          property_zip?: string | null
          qual?: string | null
          slug?: string | null
          sqft?: number | null
          tax_assessment?: number | null
          tax_assessment_year?: number | null
          updated_at?: string
          video_urls?: string[] | null
          year_built?: number | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          created_at: string | null
          function_name: string
          id: string
          identifier: string
          request_count: number | null
          updated_at: string | null
          window_start: string | null
        }
        Insert: {
          created_at?: string | null
          function_name: string
          id?: string
          identifier: string
          request_count?: number | null
          updated_at?: string | null
          window_start?: string | null
        }
        Update: {
          created_at?: string | null
          function_name?: string
          id?: string
          identifier?: string
          request_count?: number | null
          updated_at?: string | null
          window_start?: string | null
        }
        Relationships: []
      }
      service_pricing: {
        Row: {
          created_at: string
          description: string | null
          id: string
          price: number
          service_id: string
          service_name: string
          tier_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          price: number
          service_id: string
          service_name: string
          tier_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          price?: number
          service_id?: string
          service_name?: string
          tier_name?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_rate_limit: {
        Args: {
          p_function_name: string
          p_identifier: string
          p_max_requests?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      get_agent_contact_for_property: {
        Args: { property_id: string }
        Returns: {
          agent_email: string
          agent_name: string
          agent_phone: string
          brokerage_name: string
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role_secure: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_property_with_contact: {
        Args: { property_identifier: string }
        Returns: {
          acreage: number
          aerial_urls: string[]
          agent_email: string
          agent_headshot_url: string
          agent_name: string
          agent_phone: string
          bathrooms: number
          bedrooms: number
          brokerage_logo_url: string
          brokerage_name: string
          created_at: string
          floorplan_urls: string[]
          has_aerial: boolean
          has_floorplans: boolean
          has_matterport: boolean
          has_photos: boolean
          has_videos: boolean
          id: string
          matterport_urls: string[]
          photos_urls: string[]
          primary_photo_url: string
          property_address: string
          property_city: string
          property_state: string
          property_zip: string
          slug: string
          sqft: number
          updated_at: string
          video_urls: string[]
          year_built: number
        }[]
      }
      sanitize_input_text: {
        Args: { input_text: string }
        Returns: string
      }
    }
    Enums: {
      job_status:
        | "pending"
        | "quoted"
        | "accepted"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "invoice_sent"
        | "invoice_paid"
      service_type:
        | "photography"
        | "floor_plans"
        | "virtual_tour"
        | "aerial_photography"
        | "appraisal"
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
      job_status: [
        "pending",
        "quoted",
        "accepted",
        "in_progress",
        "completed",
        "cancelled",
        "invoice_sent",
        "invoice_paid",
      ],
      service_type: [
        "photography",
        "floor_plans",
        "virtual_tour",
        "aerial_photography",
        "appraisal",
      ],
    },
  },
} as const
