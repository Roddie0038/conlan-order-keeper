import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role for elevated privileges
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify JWT from request
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the JWT and get the user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user: jwtUser }, error: jwtError } = await supabase.auth.getUser(token);
    
    if (jwtError || !jwtUser) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { email, auth_user_id } = await req.json();

    if (!email || !auth_user_id) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Missing email or auth_user_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Security check: JWT user must match the auth_user_id being linked
    if (jwtUser.id !== auth_user_id) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Unauthorized: Cannot link another user\'s account' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Look up user in ordering_directory using lower(email) for case-insensitive match
    const { data: directoryUser, error: lookupError } = await supabase
      .from('ordering_directory')
      .select('email, user_id, status, can_access_ordering, role, full_name')
      .eq('email', email.toLowerCase())
      .eq('status', 'active')
      .eq('can_access_ordering', true)
      .maybeSingle();

    if (lookupError) {
      console.error('Error looking up ordering_directory:', lookupError);
      return new Response(
        JSON.stringify({ ok: false, error: 'Database error during lookup' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!directoryUser) {
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: 'Admin must add this user first in OT Admin → Users with Ordering Access enabled.'
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if already linked to a different auth user
    if (directoryUser.user_id && directoryUser.user_id !== auth_user_id) {
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: 'This email is already linked to another account.'
        }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update the ordering_directory record with the auth user_id
    const { error: updateError } = await supabase
      .from('ordering_directory')
      .update({ 
        user_id: auth_user_id,
        updated_at: new Date().toISOString()
      })
      .eq('email', email.toLowerCase());

    if (updateError) {
      console.error('Error updating ordering_directory:', updateError);
      return new Response(
        JSON.stringify({ ok: false, error: 'Failed to link account' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully linked auth user ${auth_user_id} to ordering_directory email ${email}`);

    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error in link-auth-user:', error);
    return new Response(
      JSON.stringify({ ok: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
