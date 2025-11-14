import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-sync-secret, x-sync-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface UserSyncPayload {
  type: string;
  user: {
    id: string;
    email: string;
    full_name?: string | null;
    role: string;
    primary_plant_code?: string | null;
    plant?: string | null;
    store?: string | null;
    permissions_override?: Record<string, any> | null;
    status: string;
    can_access_ordering: boolean;
    updated_at?: string;
  };
}

async function verifyHmacSignature(body: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(body)
  );
  
  const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  return expectedSignature === signature;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Verify sync secret
    const syncSecret = Deno.env.get('SYNC_SHARED_SECRET');
    if (!syncSecret) {
      console.error('SYNC_SHARED_SECRET not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const providedSecret = req.headers.get('x-sync-secret');
    if (!providedSecret || providedSecret !== syncSecret) {
      console.warn('Invalid or missing x-sync-secret');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Optional HMAC signature verification
    const signature = req.headers.get('x-sync-signature');
    const rawBody = await req.text();
    
    if (signature) {
      const isValid = await verifyHmacSignature(rawBody, signature, syncSecret);
      if (!isValid) {
        console.warn('Invalid HMAC signature');
        return new Response(
          JSON.stringify({ error: 'Invalid signature' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Parse payload
    let payload: UserSyncPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch (e) {
      console.error('Invalid JSON payload:', e);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate payload structure
    if (payload.type !== 'upsert' || !payload.user) {
      return new Response(
        JSON.stringify({ error: 'Invalid payload structure' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { user } = payload;
    if (!user.id || !user.email || !user.role || !user.status) {
      return new Response(
        JSON.stringify({ error: 'Missing required user fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase credentials');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract store code from store name (e.g., "Fort Worth 022" -> "022")
    let storeCode: string | null = null;
    if (user.store) {
      const match = user.store.match(/\s(\d{3})$/);
      if (match) {
        storeCode = match[1];
      }
    }

    // Upsert into ordering_directory
    const { error: upsertError } = await supabase
      .from('ordering_directory')
      .upsert({
        user_id: user.id,
        email: user.email,
        full_name: user.full_name || null,
        role: user.role,
        primary_plant_code: user.primary_plant_code || null,
        plant_name: user.plant || null,
        store_name: user.store || null,
        store_code: storeCode,
        permissions_override: user.permissions_override || null,
        status: user.status,
        can_access_ordering: user.can_access_ordering,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (upsertError) {
      console.error('Database upsert error:', upsertError);
      return new Response(
        JSON.stringify({ error: 'Database error', details: upsertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully synced user ${user.email} (${user.id})`);

    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
