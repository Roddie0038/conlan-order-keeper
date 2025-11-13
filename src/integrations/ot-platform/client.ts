import { createClient, SupabaseClient } from '@supabase/supabase-js';

const OT_SUPABASE_URL = "https://hpgjbpvugasktphwntee.supabase.co";
const OT_ANON_KEY = import.meta.env.VITE_OT_PLATFORM_ANON_KEY;

if (!OT_ANON_KEY) {
  console.error('❌ Missing VITE_OT_PLATFORM_ANON_KEY environment variable');
  throw new Error('Missing OT_PLATFORM_ANON_KEY environment variable. Please configure this secret.');
}

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
