import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verify authorization from Ordering platform
    const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
    if (token !== Deno.env.get('ORDERING_SYNC_SECRET')) {
      console.error('❌ Unauthorized: invalid ORDERING_SYNC_SECRET')
      return new Response('unauthorized', { status: 401, headers: corsHeaders })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, serviceKey)

    const payload = await req.json()
    console.log('📦 Received cross-dock request:', payload.request_number)

    // Validate payload
    if (!payload.requesting_store || !payload.sending_store || !Array.isArray(payload.items)) {
      return new Response(JSON.stringify({ error: 'Invalid payload structure' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check for duplicate using request_number (idempotency)
    if (payload.request_number) {
      const { data: existing } = await supabase
        .from('cross_dock_requests')
        .select('id')
        .eq('request_number', payload.request_number)
        .single()

      if (existing) {
        console.log('✓ Request already exists:', payload.request_number)
        return new Response(JSON.stringify({ success: true, duplicate: true }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    // Insert cross-dock request header
    const { data: requestRecord, error: requestError } = await supabase
      .from('cross_dock_requests')
      .insert({
        request_number: payload.request_number,
        requesting_store_number: payload.requesting_store,
        sending_store_number: payload.sending_store,
        requested_date: payload.desired_delivery_date || null,
        notes: payload.notes || null,
        plant: payload.plant,
        submitted_by_email: payload.submitted_by_email || null,
        submitted_by_name: payload.submitted_by_name || null,
        status: payload.status || 'pending',
      })
      .select('*')
      .single()

    if (requestError) {
      console.error('❌ Failed to create request:', requestError)
      return new Response(JSON.stringify({ error: 'Failed to create request', details: requestError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Insert items
    const itemsToInsert = payload.items.map((item: any) => ({
      request_id: requestRecord.id,
      product_number: String(item.product_number ?? '').trim(),
      description: (item.description ?? '').trim() || null,
      quantity_requested: Number(item.quantity ?? 0),
    }))

    const { error: itemsError } = await supabase
      .from('cross_dock_request_items')
      .insert(itemsToInsert)

    if (itemsError) {
      console.error('❌ Failed to create items:', itemsError)
      return new Response(JSON.stringify({ error: 'Failed to create items', details: itemsError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('✅ Cross-dock request ingested successfully:', requestRecord.request_number)

    return new Response(JSON.stringify({ success: true, request_number: requestRecord.request_number }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (e: any) {
    console.error('❌ ingest-cross-dock error:', e)
    return new Response(JSON.stringify({ error: 'Internal server error', details: e?.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
