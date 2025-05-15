
import { supabase as originalClient } from "./client";
import { ExtendedDatabase } from "@/types/supabase-extensions";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://cdbixtaqjppvdkyfbhkz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkYml4dGFxanBwdmRreWZiaGt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMzcwNjEsImV4cCI6MjA1NTkxMzA2MX0.mkeq7GvLjzw8om8t9mnlLLozHimoYy-HsRgJ65RRc10";

// Create a new client with our extended types
export const supabase = createClient<ExtendedDatabase>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Re-export the original client for backward compatibility
export { originalClient };
