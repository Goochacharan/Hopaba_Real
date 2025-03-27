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
          time: string
          title: string
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
          time: string
          title: string
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
          time?: string
          title?: string
        }
        Relationships: []
      }
      marketplace_listings: {
        Row: {
          approval_status: string
          category: string
          condition: string
          created_at: string
          description: string
          id: string
          images: string[] | null
          location: string
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
          description: string
          id?: string
          images?: string[] | null
          location: string
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
          description?: string
          id?: string
          images?: string[] | null
          location?: string
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
      service_providers: {
        Row: {
          address: string
          approval_status: string
          area: string
          availability: string | null
          availability_days: string[] | null
          availability_end_time: string | null
          availability_start_time: string | null
          business_hours: Json | null
          category: string
          city: string
          contact_email: string | null
          contact_phone: string | null
          coordinates: unknown | null
          created_at: string | null
          description: string | null
          distance: string | null
          experience: string | null
          hours: string | null
          id: string
          image_url: string | null
          images: string[] | null
          instagram: string | null
          languages: string[] | null
          map_link: string | null
          name: string
          open_now: boolean | null
          price: string | null
          price_range_max: number | null
          price_range_min: number | null
          price_unit: string | null
          rating: number | null
          review_count: number | null
          tags: string[] | null
          updated_at: string | null
          user_id: string | null
          website: string | null
        }
        Insert: {
          address: string
          approval_status?: string
          area: string
          availability?: string | null
          availability_days?: string[] | null
          availability_end_time?: string | null
          availability_start_time?: string | null
          business_hours?: Json | null
          category: string
          city: string
          contact_email?: string | null
          contact_phone?: string | null
          coordinates?: unknown | null
          created_at?: string | null
          description?: string | null
          distance?: string | null
          experience?: string | null
          hours?: string | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          instagram?: string | null
          languages?: string[] | null
          map_link?: string | null
          name: string
          open_now?: boolean | null
          price?: string | null
          price_range_max?: number | null
          price_range_min?: number | null
          price_unit?: string | null
          rating?: number | null
          review_count?: number | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Update: {
          address?: string
          approval_status?: string
          area?: string
          availability?: string | null
          availability_days?: string[] | null
          availability_end_time?: string | null
          availability_start_time?: string | null
          business_hours?: Json | null
          category?: string
          city?: string
          contact_email?: string | null
          contact_phone?: string | null
          coordinates?: unknown | null
          created_at?: string | null
          description?: string | null
          distance?: string | null
          experience?: string | null
          hours?: string | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          instagram?: string | null
          languages?: string[] | null
          map_link?: string | null
          name?: string
          open_now?: boolean | null
          price?: string | null
          price_range_max?: number | null
          price_range_min?: number | null
          price_unit?: string | null
          rating?: number | null
          review_count?: number | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      gtrgm_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_options: {
        Args: {
          "": unknown
        }
        Returns: undefined
      }
      gtrgm_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      search_recommendations: {
        Args: {
          search_query: string
          category_filter?: string
        }
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
        Args: {
          search_term: string
        }
        Returns: {
          suggestion: string
          category: string
          source: string
        }[]
      }
      set_limit: {
        Args: {
          "": number
        }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: {
          "": string
        }
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
