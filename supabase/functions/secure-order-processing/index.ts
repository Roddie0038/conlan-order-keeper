import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-client-debug',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
  'Content-Type': 'application/json',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderData, tableName, action } = await req.json();

    // Redact sensitive fields for logs
    const redact = (obj: any) => {
      try {
        const c = JSON.parse(JSON.stringify(obj));
        if (c?.email) c.email = '[redacted]';
        if (c?.manager_email) c.manager_email = '[redacted]';
        if (c?.destination_manager_email) c.destination_manager_email = '[redacted]';
        return c;
      } catch {
        return undefined;
      }
    };

    console.log(`🧾 SECURE ORDER PROCESSING - Parsed body`, {
      action,
      tableName,
      orderData: redact(orderData),
    });

    // Create Supabase client with service role key for secure operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    console.log(`🔒 SECURE ORDER PROCESSING - Processing ${action} for table ${tableName}`);

    if (action === 'create_order') {
      // Securely insert order using service role permissions
      const { data, error } = await supabase
        .from(tableName)
        .insert(orderData)
        .select()
        .single();

      if (error) {
        console.error('❌ SECURE ORDER PROCESSING - Database error:', error);
        return new Response(
          JSON.stringify({
            ok: false,
            error: 'DATABASE_ERROR',
            message: error.message,
            details: { code: (error as any)?.code, hint: (error as any)?.hint, details: (error as any)?.details }
          }),
          { status: 400, headers: corsHeaders }
        );
      }

      console.log('✅ SECURE ORDER PROCESSING - Order created successfully');
      return new Response(
        JSON.stringify({ ok: true, data }),
        { headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({ ok: false, error: 'INVALID_ACTION', message: 'Invalid action' }),
      { status: 400, headers: corsHeaders }
    );

  } catch (error: any) {
    console.error('❌ SECURE ORDER PROCESSING - Unexpected error:', error);
    return new Response(
      JSON.stringify({
        ok: false,
        error: 'UNKNOWN_ERROR',
        message: error?.message || 'Internal server error',
        details: error?.stack || null,
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});