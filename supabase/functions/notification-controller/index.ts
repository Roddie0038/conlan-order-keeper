import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-internal-secret',
};

type EmailType = 
  | 'transfer'
  | 'mto'
  | 'wheel'
  | 'warranty'
  | 'cross_dock'
  | 'completion'
  | 'out_of_stock'
  | 'message'
  | 'customer_complaints';

interface NotificationRequest {
  order_type: EmailType;
  store_number: string;
  plant?: string;
  payload: {
    order_id?: string;
    store_name?: string;
    submitted_by_name?: string;
    submitted_by_email?: string;
    product_number?: string;
    quantity?: number;
    description?: string;
    notes?: string;
    timestamp?: string;
    // MTO-specific fields
    casing_grade?: string;
    tire_size?: string;
    tread?: string;
    [key: string]: any;
  };
  idempotency_key?: string;
  source?: 'ordering_v4' | 'ot_trigger' | 'manual';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Validate authentication
    const authHeader = req.headers.get('authorization');
    const internalSecret = req.headers.get('x-internal-secret');
    
    if (!authHeader?.includes('Bearer') && !internalSecret) {
      console.error('Missing authentication');
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { 
          status: 401, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    const body = await req.json().catch(() => ({}));

    const cg = body?.casing_grade ??
      body?.orderRecord?.casing_grade ??
      body?.payload?.casing_grade ??
      body?.casingGrade ??
      body?.orderRecord?.casingGrade ??
      body?.payload?.casingGrade ?? '';

    const ts = body?.tire_size ??
      body?.orderRecord?.tire_size ??
      body?.payload?.tire_size ??
      body?.tireSize ??
      body?.orderRecord?.tireSize ??
      body?.payload?.tireSize ?? '';

    console.log('[MTO PAYLOAD]', {
      at: 'notification-controller',
      order_id: body?.order_id ?? body?.orderRecord?.order_id ?? body?.payload?.order_id ?? null,
      casing_grade: cg,
      tire_size: ts,
      keys: Object.keys(body || {})
    });

    const normalized = { ...body, casing_grade: cg, tire_size: ts };
    if (normalized.payload) {
      normalized.payload = { ...normalized.payload, casing_grade: cg, tire_size: ts };
    }

    const { order_type, store_number, plant, payload, idempotency_key, source }: NotificationRequest = normalized;

    console.log('Notification controller invoked:', { 
      order_type, 
      store_number, 
      plant,
      idempotency_key,
      source,
      payload_keys: Object.keys(payload)
    });

    // Check for duplicate using idempotency key
    if (idempotency_key) {
      const { data: existingLog } = await supabase
        .from('notification_logs')
        .select('id')
        .eq('metadata->>idempotency_key', idempotency_key)
        .single();

      if (existingLog) {
        console.log('Duplicate notification prevented:', idempotency_key);
        return new Response(
          JSON.stringify({ 
            message: 'Notification already processed',
            idempotency_key
          }),
          { 
            status: 200, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders } 
          }
        );
      }
    }

    // Validate required fields
    if (!order_type || !store_number) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: order_type, store_number' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Map order type to email type enum
    const emailTypeMap: Record<string, string> = {
      'transfer': 'transfer',
      'mto': 'mto', 
      'wheel': 'wheel',
      'warranty': 'warranty',
      'cross_dock': 'cross_dock',
      'completion': 'completion',
      'out_of_stock': 'out_of_stock',
      'message': 'message',
      'customer_complaints': 'customer_complaints'
    };

    const emailType = emailTypeMap[order_type];
    if (!emailType) {
      return new Response(
        JSON.stringify({ error: `Invalid order_type: ${order_type}` }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Resolve email recipients using the canonical resolver
    console.log(`Resolving recipients for store: ${store_number}, email_type: ${emailType}`);
    
    const { data: recipients, error: resolverError } = await supabase.rpc(
      'resolve_email_recipients', 
      { 
        p_store: store_number, 
        p_type: emailType 
      }
    );

    if (resolverError) {
      console.error('Error resolving recipients:', resolverError);
      return new Response(
        JSON.stringify({ error: 'Failed to resolve recipients', details: resolverError.message }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    if (!recipients || recipients.length === 0) {
      console.log(`No recipients found for store ${store_number}, email_type ${emailType}`);
      return new Response(
        JSON.stringify({ 
          message: 'No recipients configured',
          store_number,
          email_type: emailType
        }),
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    console.log(`Found ${recipients.length} recipients:`, recipients.map((r: any) => ({ email: r.recipient_email, role: r.recipient_role })));

    // Send notifications to each recipient
    const results = [];
    
    for (const recipient of recipients) {
      try {
        // Prepare email payload for the ordering-confirmation-email function
        const emailPayload = {
          order_type: 'workflow', // Use workflow type for warehouse/plant notifications
          order_id: payload.order_id,
          store_number,
          store_name: payload.store_name || store_number,
          plant: plant || store_number,
          submitted_by_name: payload.submitted_by_name,
          submitted_by_email: payload.submitted_by_email,
          recipient_email: recipient.recipient_email,
          recipient_role: recipient.recipient_role,
          product_number: payload.product_number,
          quantity: payload.quantity,
          description: payload.description,
          notes: payload.notes,
          timestamp: payload.timestamp || new Date().toISOString(),
          // MTO-specific fields - use normalized values
          casing_grade: cg || payload.casing_grade,
          tire_size: ts || payload.tire_size,
          tread: payload.tread
        };

        // Temporary debug logging for MTO fields - expanded
        if (order_type === 'mto') {
          console.log('[MTO INSERT]', {
            casing_grade: cg || payload.casing_grade,
            tire_size: ts || payload.tire_size,
            store: payload.store_name || store_number,
            plant: plant || store_number,
            status: payload.status || 'open',
            has_required_fields: !!(cg || payload.casing_grade) && !!(ts || payload.tire_size)
          });
        }

        console.log(`Sending notification to ${recipient.recipient_email} (${recipient.recipient_role})`);

        // Call the ordering-confirmation-email function
        const { data: emailResult, error: emailError } = await supabase.functions.invoke(
          'ordering-confirmation-email',
          {
            body: emailPayload,
            headers: {
              'Authorization': `Bearer ${supabaseServiceKey}`
            }
          }
        );

        if (emailError) {
          console.error(`Failed to send email to ${recipient.recipient_email}:`, emailError);
          results.push({
            recipient: recipient.recipient_email,
            role: recipient.recipient_role,
            status: 'failed',
            error: emailError.message
          });
        } else {
          console.log(`Email sent successfully to ${recipient.recipient_email}`);
          results.push({
            recipient: recipient.recipient_email,
            role: recipient.recipient_role,
            status: 'sent'
          });
        }

      } catch (error) {
        console.error(`Error sending email to ${recipient.recipient_email}:`, error);
        results.push({
          recipient: recipient.recipient_email,
          role: recipient.recipient_role,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Log notification attempt
    try {
      await supabase.from('notification_logs').insert({
        order_id: payload.order_id,
        order_number: payload.order_id,
        order_type,
        notification_type: emailType,
        recipient_email: recipients.map((r: any) => r.recipient_email).join(','),
        recipient_role: 'multiple',
        status: 'batch_processed',
        plant: plant || store_number,
        store: store_number,
        platform: 'ordering_platform',
        metadata: {
          recipients_count: recipients.length,
          results,
          trigger_source: 'notification_controller',
          idempotency_key,
          source
        }
      });
    } catch (logError) {
      console.error('Failed to log notification:', logError);
    }

    return new Response(
      JSON.stringify({
        message: 'Notifications processed',
        recipients_found: recipients.length,
        results
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error) {
    console.error('Error in notification-controller:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
};

serve(handler);