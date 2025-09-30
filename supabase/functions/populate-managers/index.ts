
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Edge function to populate managers table with correct data
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Managers data with correct roles and plant assignments
    const managersData = [
      // Plant 97 - Grand Prairie managers
      { name: 'Gabriel Sumodobila', email: 'gsumodobila@conlantire.com', role: 'plant_manager', plant_code: '97' },
      { name: 'Jesus Esquivel', email: 'jesquivel@conlantire.com', role: 'retread_manager', plant_code: '97' },
      { name: 'John Palos', email: 'jpalos@conlantire.com', role: 'retread_manager', plant_code: '97' },
      { name: 'Brett Perry', email: 'bperry@conlantire.com', role: 'operations_manager', plant_code: '97' },
      
      // Plant 99 - Mulberry managers
      { name: 'David Lee', email: 'dlee@conlantire.com', role: 'plant_manager', plant_code: '99' },
      { name: 'Luis Parson', email: 'lparson@conlantire.com', role: 'warehouse_manager', plant_code: '99' },
      
      // Plant 98 - Romulus managers (if needed for future)
      // Add more managers as needed
    ];

    console.log('🔄 Populating managers table...');

    // Insert managers using upsert to handle conflicts
    for (const manager of managersData) {
      const { error } = await supabaseClient
        .from('managers')
        .upsert(
          { ...manager, is_active: true },
          { onConflict: 'email' }
        );

      if (error) {
        console.error(`❌ Error inserting manager ${manager.email}:`, error);
      } else {
        console.log(`✅ Upserted manager: ${manager.name} (${manager.email})`);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Managers table populated successfully',
      managersCount: managersData.length
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error populating managers:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: (error as Error).message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
