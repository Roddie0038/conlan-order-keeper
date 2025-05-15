
import { Database as OriginalDatabase } from "@/integrations/supabase/types";

// Extend the original Database type to include our new inventory_documents table
export interface ExtendedDatabase extends OriginalDatabase {
  public: {
    Tables: OriginalDatabase["public"]["Tables"] & {
      inventory_documents: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          type: string;
          date: string;
          file_name: string | null;
          file_size: string | null;
          file_path: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          type: string;
          date?: string;
          file_name?: string | null;
          file_size?: string | null;
          file_path?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          type?: string;
          date?: string;
          file_name?: string | null;
          file_size?: string | null;
          file_path?: string | null;
        };
        Relationships: [];
      };
    };
    Views: OriginalDatabase["public"]["Views"];
    Functions: OriginalDatabase["public"]["Functions"];
    Enums: OriginalDatabase["public"]["Enums"];
    CompositeTypes: OriginalDatabase["public"]["CompositeTypes"];
  };
}
