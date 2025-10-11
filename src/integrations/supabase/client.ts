import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Prefer runtime values injected by public/env.js, fallback to build-time envs
const RUNTIME = (window as any)?.__PUBLIC_ENV__ ?? {};
const SUPABASE_URL = RUNTIME.VITE_SUPABASE_URL ?? import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = RUNTIME.VITE_SUPABASE_ANON_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Log which project is being used (helpful for verification)
const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
console.info(`[Supabase Client] Using project: ${projectRef || 'unknown'}`);

export const supabase: SupabaseClient<Database> = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);