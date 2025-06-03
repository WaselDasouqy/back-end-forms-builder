export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      forms: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          user_id: string;
          is_public: boolean;
          created_at: string;
          updated_at: string;
          settings: Json;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          user_id: string;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
          settings?: Json;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          user_id?: string;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
          settings?: Json;
        };
      };
      form_fields: {
        Row: {
          id: string;
          form_id: string;
          type: string;
          label: string;
          description: string | null;
          required: boolean;
          placeholder: string | null;
          default_value: string | null;
          f_order: number;
          created_at: string;
          updated_at: string;
          properties: Json;
        };
        Insert: {
          id?: string;
          form_id: string;
          type: string;
          label: string;
          description?: string | null;
          required?: boolean;
          placeholder?: string | null;
          default_value?: string | null;
          f_order: number;
          created_at?: string;
          updated_at?: string;
          properties?: Json;
        };
        Update: {
          id?: string;
          form_id?: string;
          type?: string;
          label?: string;
          description?: string | null;
          required?: boolean;
          placeholder?: string | null;
          default_value?: string | null;
          f_order?: number;
          created_at?: string;
          updated_at?: string;
          properties?: Json;
        };
      };
      field_options: {
        Row: {
          id: string;
          field_id: string;
          value: string;
          description: string | null;
          f_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          field_id: string;
          value: string;
          description?: string | null;
          f_order: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          field_id?: string;
          value?: string;
          description?: string | null;
          f_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      form_responses: {
        Row: {
          id: string;
          form_id: string;
          user_id: string | null;
          submitted_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          form_id: string;
          user_id?: string | null;
          submitted_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          form_id?: string;
          user_id?: string | null;
          submitted_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      response_values: {
        Row: {
          id: string;
          response_id: string;
          field_id: string;
          value: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          response_id: string;
          field_id: string;
          value?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          response_id?: string;
          field_id?: string;
          value?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      form_themes: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          properties: Json;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          properties: Json;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          properties?: Json;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
} 