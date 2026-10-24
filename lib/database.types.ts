// Supabase generated-style types for typed client usage
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: string;
          admin_state: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: string;
          admin_state?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      listings: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          short_desc: string | null;
          town: string;
          address: string | null;
          phone: string | null;
          website: string | null;
          email: string | null;
          age_min: number | null;
          age_max: number | null;
          cost_description: string | null;
          is_free: boolean;
          status: string;
          is_featured: boolean;
          owner_id: string | null;
          state: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["listings"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["listings"]["Insert"]>;
      };
      events: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          listing_id: string | null;
          owner_id: string | null;
          town: string;
          address: string | null;
          start_date: string;
          end_date: string | null;
          start_time: string | null;
          end_time: string | null;
          is_free: boolean;
          cost: string | null;
          age_min: number | null;
          age_max: number | null;
          is_recurring: boolean;
          recurrence_rule: string | null;
          status: string;
          is_featured: boolean;
          state: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["events"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["events"]["Insert"]>;
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          icon: string | null;
          color: string | null;
          sort_order: number;
        };
        Insert: Omit<Database["public"]["Tables"]["categories"]["Row"], "id"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
      };
      listing_categories: {
        Row: { listing_id: string; category_id: string };
        Insert: { listing_id: string; category_id: string };
        Update: Partial<Database["public"]["Tables"]["listing_categories"]["Insert"]>;
      };
      event_categories: {
        Row: { event_id: string; category_id: string };
        Insert: { event_id: string; category_id: string };
        Update: Partial<Database["public"]["Tables"]["event_categories"]["Insert"]>;
      };
      listing_images: {
        Row: {
          id: string;
          listing_id: string;
          url: string;
          is_primary: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["listing_images"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["listing_images"]["Insert"]>;
      };
      listing_hours: {
        Row: {
          id: string;
          listing_id: string;
          day_of_week: number;
          opens_at: string | null;
          closes_at: string | null;
          is_closed: boolean;
        };
        Insert: Omit<Database["public"]["Tables"]["listing_hours"]["Row"], "id"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["listing_hours"]["Insert"]>;
      };
      towns: {
        Row: {
          id: string;
          name: string;
          slug: string;
          county: string | null;
          state: string;
        };
        Insert: Omit<Database["public"]["Tables"]["towns"]["Row"], "id"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["towns"]["Insert"]>;
      };
      analytics_events: {
        Row: {
          id: string;
          event_type: string;
          listing_id: string | null;
          event_id: string | null;
          session_id: string | null;
          state: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["analytics_events"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["analytics_events"]["Insert"]>;
      };
      blog_posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          excerpt: string | null;
          body: string;
          meta_title: string | null;
          meta_description: string | null;
          featured_image: string | null;
          status: string;
          author_name: string;
          published_at: string | null;
          state: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["blog_posts"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["blog_posts"]["Insert"]>;
      };
      blog_categories: {
        Row: { id: string; name: string; slug: string; created_at: string };
        Insert: Omit<Database["public"]["Tables"]["blog_categories"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["blog_categories"]["Insert"]>;
      };
      blog_post_categories: {
        Row: { post_id: string; category_id: string };
        Insert: { post_id: string; category_id: string };
        Update: Partial<Database["public"]["Tables"]["blog_post_categories"]["Insert"]>;
      };
      blog_post_keywords: {
        Row: { id: string; post_id: string; keyword: string };
        Insert: Omit<Database["public"]["Tables"]["blog_post_keywords"]["Row"], "id"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["blog_post_keywords"]["Insert"]>;
      };
      ad_slots: {
        Row: {
          id: string;
          name: string;
          label: string;
          ad_type: string;
          code: string | null;
          is_active: boolean;
          state: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["ad_slots"]["Row"], "id" | "updated_at"> & {
          id?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["ad_slots"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
