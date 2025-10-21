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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anonKey     = Deno.env.get('SUPABASE_ANON_KEY')!        // user-context client (RLS enforced)
    const serviceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') // ONLY for server→server HTTP if needed

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization Bearer token' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // USER client — carries the user's JWT so RLS applies to all DB writes
    const supabaseUser = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    const { requestData, items } = await req.json()

    // Validate payload
    if (!requestData?.requesting_store || !requestData?.sending_store || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    if (requestData.requesting_store === requestData.sending_store) {
      return new Response(JSON.stringify({ error: 'Requesting and sending stores cannot be the same' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Insert header AS USER (RLS enforced)
    const { data: requestRecord, error: requestError } = await supabaseUser
      .from('cross_dock_requests')
      .insert({
        requesting_store: requestData.requesting_store,
        sending_store: requestData.sending_store,
        desired_delivery_date: requestData.desired_delivery_date || null,
        notes: requestData.notes || null,
        plant: requestData.plant,
        submitted_by_email: requestData.submitted_by_email || null,
        submitted_by_name: requestData.submitted_by_name || null,
        status: 'pending',
      })
      .select('*')
      .single()

    if (requestError) {
      console.error('create request error', requestError)
      return new Response(JSON.stringify({ error: 'Failed to create request', details: requestError.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Validate and insert items AS USER (RLS enforced)
    const itemsToInsert = items.map((it: any) => ({
      request_id: requestRecord.id,
      product_number: String(it.product_number ?? '').trim(),
      description: (it.description ?? '').trim() || null,
      quantity: Number(it.quantity ?? 0),
    }))
    const invalid = itemsToInsert.find(i => !i.product_number || i.quantity <= 0)
    if (invalid) {
      return new Response(JSON.stringify({ error: 'Invalid item rows (product_number required, quantity > 0)' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { error: itemsError } = await supabaseUser
      .from('cross_dock_request_items')
      .insert(itemsToInsert)

    if (itemsError) {
      console.error('create items error', itemsError)
      return new Response(JSON.stringify({ error: 'Failed to create request items', details: itemsError.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Audit AS USER
    await supabaseUser.from('cross_dock_request_audit').insert({
      request_id: requestRecord.id,
      action: 'created',
      new_status: 'pending',
      notes: `Request created with ${items.length} item(s)`,
    })

    // Optional push to OT (don't fail user if OT is unavailable)
    const otUrl = Deno.env.get('OT_INGEST_URL')
    const internalToken = Deno.env.get('INTERNAL_TOKEN')
    if (otUrl && internalToken) {
      const otPayload = {
        type: 'cross_dock_request',
        request: { ...requestRecord, items: items.map((i: any) => ({
          product_number: i.product_number, description: i.description, quantity: i.quantity
        })) }
      }
      const otResp = await fetch(otUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${internalToken}` },
        body: JSON.stringify(otPayload),
      })
      if (!otResp.ok) {
        console.error('OT push failed', otResp.status, await otResp.text())
      }
    }

    return new Response(JSON.stringify({ success: true, request: requestRecord }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (e: any) {
    console.error('submit-cross-dock-request fatal', e)
    return new Response(JSON.stringify({ error: 'Internal server error', details: e?.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
