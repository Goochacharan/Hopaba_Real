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
      admin_users: {
        Row: {
          created_at: string
          id: string
        }
        Insert: {
          created_at?: string
          id: string
        }
        Update: {
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          approval_status: string
          attendees: number | null
          created_at: string
          date: string
          description: string
          id: string
          image: string
          location: string
          price_per_person: number | null
          time: string
          title: string
          user_id: string | null
        }
        Insert: {
          approval_status?: string
          attendees?: number | null
          created_at?: string
          date: string
          description: string
          id?: string
          image: string
          location: string
          price_per_person?: number | null
          time: string
          title: string
          user_id?: string | null
        }
        Update: {
          approval_status?: string
          attendees?: number | null
          created_at?: string
          date?: string
          description?: string
          id?: string
          image?: string
          location?: string
          price_per_person?: number | null
          time?: string
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      marketplace_listings: {
        Row: {
          approval_status: string
          category: string
          condition: string
          created_at: string
          damage_images: string[] | null
          description: string
          id: string
          images: string[] | null
          is_negotiable: boolean | null
          location: string
          map_link: string | null
          price: number
          seller_id: string | null
          seller_instagram: string | null
          seller_name: string
          seller_phone: string | null
          seller_rating: number | null
          seller_whatsapp: string | null
          title: string
          updated_at: string
        }
        Insert: {
          approval_status?: string
          category: string
          condition: string
          created_at?: string
          damage_images?: string[] | null
          description: string
          id?: string
          images?: string[] | null
          is_negotiable?: boolean | null
          location: string
          map_link?: string | null
          price: number
          seller_id?: string | null
          seller_instagram?: string | null
          seller_name: string
          seller_phone?: string | null
          seller_rating?: number | null
          seller_whatsapp?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          approval_status?: string
          category?: string
          condition?: string
          created_at?: string
          damage_images?: string[] | null
          description?: string
          id?: string
          images?: string[] | null
          is_negotiable?: boolean | null
          location?: string
          map_link?: string | null
          price?: number
          seller_id?: string | null
          seller_instagram?: string | null
          seller_name?: string
          seller_phone?: string | null
          seller_rating?: number | null
          seller_whatsapp?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          address: string
          category: string
          city: string | null
          created_at: string
          description: string
          distance: string | null
          hours: string | null
          id: string
          image: string
          images: string[] | null
          instagram: string | null
          name: string
          open_now: boolean | null
          phone: string | null
          price: string | null
          price_level: string | null
          rating: number | null
          review_count: number | null
          tags: string[] | null
          website: string | null
        }
        Insert: {
          address: string
          category: string
          city?: string | null
          created_at?: string
          description: string
          distance?: string | null
          hours?: string | null
          id?: string
          image: string
          images?: string[] | null
          instagram?: string | null
          name: string
          open_now?: boolean | null
          phone?: string | null
          price?: string | null
          price_level?: string | null
          rating?: number | null
          review_count?: number | null
          tags?: string[] | null
          website?: string | null
        }
        Update: {
          address?: string
          category?: string
          city?: string | null
          created_at?: string
          description?: string
          distance?: string | null
          hours?: string | null
          id?: string
          image?: string
          images?: string[] | null
          instagram?: string | null
          name?: string
          open_now?: boolean | null
          phone?: string | null
          price?: string | null
          price_level?: string | null
          rating?: number | null
          review_count?: number | null
          tags?: string[] | null
          website?: string | null
        }
        Relationships: []
      }
      seller_reviews: {
        Row: {
          comment: string
          created_at: string
          id: string
          rating: number
          reviewer_id: string | null
          reviewer_name: string
          seller_id: string
        }
        Insert: {
          comment: string
          created_at?: string
          id?: string
          rating: number
          reviewer_id?: string | null
          reviewer_name: string
          seller_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          rating?: number
          reviewer_id?: string | null
          reviewer_name?: string
          seller_id?: string
        }
        Relationships: []
      }
      service_providers: {
        Row: {
          address: string
          approval_status: string | null
          area: string
          availability: string | null
          availability_days: string[] | null
          availability_end_time: string | null
          availability_start_time: string | null
          category: string
          city: string
          contact_email: string | null
          contact_phone: string
          created_at: string
          description: string
          experience: string | null
          hours: string | null
          id: string
          images: string[] | null
          instagram: string | null
          languages: string[] | null
          map_link: string | null
          name: string
          price_range_max: number | null
          price_range_min: number | null
          price_unit: string | null
          tags: string[] | null
          updated_at: string
          user_id: string
          website: string | null
          whatsapp: string
        }
        Insert: {
          address: string
          approval_status?: string | null
          area: string
          availability?: string | null
          availability_days?: string[] | null
          availability_end_time?: string | null
          availability_start_time?: string | null
          category: string
          city: string
          contact_email?: string | null
          contact_phone: string
          created_at?: string
          description: string
          experience?: string | null
          hours?: string | null
          id?: string
          images?: string[] | null
          instagram?: string | null
          languages?: string[] | null
          map_link?: string | null
          name: string
          price_range_max?: number | null
          price_range_min?: number | null
          price_unit?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id: string
          website?: string | null
          whatsapp: string
        }
        Update: {
          address?: string
          approval_status?: string | null
          area?: string
          availability?: string | null
          availability_days?: string[] | null
          availability_end_time?: string | null
          availability_start_time?: string | null
          category?: string
          city?: string
          contact_email?: string | null
          contact_phone?: string
          created_at?: string
          description?: string
          experience?: string | null
          hours?: string | null
          id?: string
          images?: string[] | null
          instagram?: string | null
          languages?: string[] | null
          map_link?: string | null
          name?: string
          price_range_max?: number | null
          price_range_min?: number | null
          price_unit?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string
          website?: string | null
          whatsapp?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      search_recommendations: {
        Args: { search_query: string; category_filter?: string }
        Returns: {
          id: string
          name: string
          image: string
          images: string[]
          category: string
          description: string
          address: string
          rating: number
          price: string
          price_level: string
          phone: string
          website: string
          open_now: boolean
          hours: string
          distance: string
          tags: string[]
          city: string
          instagram: string
          review_count: number
          similarity: number
        }[]
      }
      search_suggestions: {
        Args: { search_term: string }
        Returns: {
          suggestion: string
          category: string
          source: string
        }[]
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
