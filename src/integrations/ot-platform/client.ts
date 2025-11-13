import { createClient, SupabaseClient } from '@supabase/supabase-js';

const OT_SUPABASE_URL = "https://hpgjbpvugasktphwntee.supabase.co";
// OT Platform anon key - this is a publishable key, safe for client-side use
const OT_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwZ2picHZ1Z2Fza3RwaHdudGVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA2NTk4MzYsImV4cCI6MjA0NjIzNTgzNn0.shKfpzKJR81eP3m1G5GRzrq4HHdkNrPhFp_jYoTJtpg";

console.info('[OT Platform Client] Connecting to OT Platform:', OT_SUPABASE_URL);

export const otClient: SupabaseClient = createClient(
  OT_SUPABASE_URL,
  OT_ANON_KEY,
  {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      headers: {
        'X-Client-Info': 'ordering-platform',
      },
    },
  }
);
