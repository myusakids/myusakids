// Supabase generated-style types for typed client usage
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
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
        };
        Insert: Omit<Database["public"]["Tables"]["towns"]["Row"], "id"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["towns"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
