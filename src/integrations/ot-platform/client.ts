import { createClient, SupabaseClient } from '@supabase/supabase-js';

const OT_SUPABASE_URL = "https://hpgjbpvugasktphwntee.supabase.co";
// OT Platform anon key - this is a publishable key, safe for client-side use
const OT_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwZ2picHZ1Z2Fza3RwaHdudGVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjQ2MjYsImV4cCI6MjA3NDg0MDYyNn0.rdBeHuUhHa_4yrdzXHnGzcXAolrcfPKV2mQhdjcgnYY";

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
