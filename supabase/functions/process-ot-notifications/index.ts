import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookEvent {
  id: string;
  event_type: string;
  event_id: string;
  payload: {
    order_number?: string;
    order_type?: string;
    store?: string;
    plant?: string;
    status?: string;
    [key: string]: any;
  };
  status: string;
  created_at: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing OT notifications...');

    const otSupabase = createClient(
      Deno.env.get('OT_SUPABASE_URL')!,
      Deno.env.get('OT_SERVICE_ROLE_KEY')!
    );

    const orderingSupabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Fetch pending webhook events from OT Platform
    const { data: events, error: fetchError } = await otSupabase
      .from('webhook_outbox')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(50);

    if (fetchError) {
      console.error('Error fetching events:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${events?.length || 0} pending events`);

    for (const event of events || []) {
      try {
        await processEvent(event, orderingSupabase);
        
        // Mark as processed in OT
        await otSupabase
          .from('webhook_outbox')
          .update({ status: 'delivered', delivered_at: new Date().toISOString() })
          .eq('id', event.id);

        console.log(`Processed event ${event.id}: ${event.event_type}`);
      } catch (error) {
        console.error(`Error processing event ${event.id}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: events?.length || 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in notification processor:', error);
    return new Response(
      JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function processEvent(event: WebhookEvent, supabase: any) {
  const { event_type, payload } = event;
  
  console.log(`Processing event type: ${event_type}`, payload);
  
  // Create notification details from event
  const notification = createNotificationFromEvent(event_type, payload);
  
  // Find affected users based on store/plant
  const { data: users, error: userError } = await supabase
    .from('ordering_directory')
    .select('user_id, email, full_name, primary_plant_code')
    .eq('primary_plant_code', payload.plant)
    .eq('status', 'active')
    .eq('can_access_ordering', true);

  if (userError) {
    console.error('Error fetching users:', userError);
    throw userError;
  }

  console.log(`Found ${users?.length || 0} affected users for plant ${payload.plant}`);

  // Create notifications for each user
  for (const user of users || []) {
    const { error: insertError } = await supabase
      .from('user_notifications')
      .insert({
        user_id: user.user_id,
        notification_type: 'order_event',
        event_type: event_type,
        order_number: payload.order_number,
        order_type: payload.order_type,
        store_ref: payload.store,
        plant_code: payload.plant,
        title: notification.title,
        message: notification.message,
        metadata: payload
      });

    if (insertError) {
      console.error(`Error creating notification for user ${user.user_id}:`, insertError);
    } else {
      console.log(`Created notification for user ${user.email}`);
    }
  }
}

function createNotificationFromEvent(eventType: string, payload: any) {
  const titleMap: Record<string, string> = {
    'order.created': '🆕 New Order Created',
    'order.updated': '🔄 Order Updated',
    'order.completed': '✅ Order Completed',
    'order.approved': '✅ Order Approved',
    'order.denied': '❌ Order Denied',
    'mto.created': '🆕 MTO Order Created',
    'mto.updated': '🔄 MTO Order Updated',
    'wheel.created': '🆕 Wheel Order Created',
    'warranty.created': '🛡️ Warranty Order Created',
    'warranty.approved': '✅ Warranty Approved',
    'warranty.denied': '❌ Warranty Denied',
    'cross_dock.created': '🚚 Cross Dock Request Created',
  };

  const messageMap: Record<string, string> = {
    'order.created': `Order ${payload.order_number} has been created`,
    'order.updated': `Order ${payload.order_number} status: ${payload.status}`,
    'order.completed': `Order ${payload.order_number} has been completed`,
    'order.approved': `Order ${payload.order_number} has been approved`,
    'order.denied': `Order ${payload.order_number} has been denied`,
    'mto.created': `MTO order ${payload.order_number} has been created`,
    'mto.updated': `MTO order ${payload.order_number} has been updated`,
    'wheel.created': `Wheel order ${payload.order_number} has been created`,
    'warranty.created': `Warranty order ${payload.order_number} has been created`,
    'warranty.approved': `Warranty ${payload.order_number} has been approved`,
    'warranty.denied': `Warranty ${payload.order_number} has been denied`,
    'cross_dock.created': `Cross dock request ${payload.order_number} has been created`,
  };

  return {
    title: titleMap[eventType] || '📢 Order Notification',
    message: messageMap[eventType] || `Event: ${eventType} for order ${payload.order_number || 'N/A'}`
  };
}
