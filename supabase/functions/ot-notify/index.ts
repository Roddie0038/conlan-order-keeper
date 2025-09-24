import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OTNotifyRequest {
  email_type: string;
  store_number?: string;
  plant_code?: string;
  idempotency_key: string;
  admin_override?: boolean;
  payload: Record<string, any>;
  dry_run?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🔐 OT-NOTIFY - Processing notification request");
    
    // Parse request body
    const requestData: OTNotifyRequest = await req.json();
    
    // Validate required fields with specific error messages
    const missingFields: string[] = [];
    
    if (!requestData.email_type) missingFields.push("email_type");
    if (!requestData.idempotency_key) missingFields.push("idempotency_key");
    if (!requestData.store_number && !requestData.plant_code) {
      missingFields.push("store_number or plant_code");
    }

    if (missingFields.length > 0) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: `Missing required fields: ${missingFields.join(', ')}`,
          source: "ot-notify-proxy"
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Ensure proper padding for store numbers and plant codes
    if (requestData.store_number) {
      requestData.store_number = requestData.store_number.padStart(3, '0');
    }
    if (requestData.plant_code) {
      requestData.plant_code = requestData.plant_code.padStart(3, '0');
    }

    console.log("🔐 OT-NOTIFY - Request validated:", {
      email_type: requestData.email_type,
      store_number: requestData.store_number,
      plant_code: requestData.plant_code,
      idempotency_key: requestData.idempotency_key,
      admin_override: requestData.admin_override || false,
      dry_run: requestData.dry_run || false
    });

    // Get internal token from server environment
    const internalToken = Deno.env.get("INTERNAL_TOKEN");
    if (!internalToken) {
      throw new Error("Internal token not configured");
    }

    // Forward request to OT notification-controller with proper headers
    const otControllerUrl = "https://cdbixtaqjppvdkyfbhkz.supabase.co/functions/v1/notification-controller";
    
    // Get original Authorization header from client request
    const authHeader = req.headers.get("Authorization");
    
    const forwardHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      "x-internal-token": internalToken,
    };

    // Forward Authorization header if present
    if (authHeader) {
      forwardHeaders["Authorization"] = authHeader;
    }

    console.log("🔐 OT-NOTIFY - Forwarding to OT controller:", otControllerUrl);

    // Normalize payload structure for notification-controller
    const normalizedPayload = {
      order_type: requestData.email_type, // Map email_type to order_type
      store_number: requestData.store_number,
      plant: requestData.plant_code,
      payload: {
        ...requestData.payload,
        // Ensure MTO fields are present in snake_case with proper formatting
        store: requestData.payload?.store || `Grand Prairie 0${requestData.store_number}`,
        store_number: requestData.store_number,
        plant: requestData.plant_code || requestData.payload?.plant || 'Grand Prairie 097',
        ordering_plant: requestData.payload?.ordering_plant || requestData.plant_code || 'Grand Prairie 097',
        destination_plant: requestData.payload?.destination_plant || requestData.plant_code || 'Grand Prairie 097',
        casing_grade: requestData.payload?.casing_grade || requestData.payload?.casingGrade,
        tire_size: requestData.payload?.tire_size || requestData.payload?.tireSize,
        tread: requestData.payload?.tread || requestData.payload?.tireTreadNeeded,
        quantity: requestData.payload?.quantity,
        notes: requestData.payload?.notes || '',
        submitted_by_name: requestData.payload?.submitted_by_name || requestData.payload?.name,
        submitted_by_email: requestData.payload?.submitted_by_email || requestData.payload?.email,
        status: requestData.payload?.status || 'open',
        order_type: 'mto',
        type: 'MTO'
      },
      idempotency_key: requestData.idempotency_key,
      source: 'ot-notify-proxy'
    };

    const otResponse = await fetch(otControllerUrl, {
      method: "POST",
      headers: forwardHeaders,
      body: JSON.stringify(normalizedPayload),
    });

    const otResponseData = await otResponse.json();
    
    console.log("🔐 OT-NOTIFY - OT controller response:", {
      status: otResponse.status,
      success: otResponseData.success || false
    });

    // Return OT controller response as-is
    return new Response(JSON.stringify(otResponseData), {
      status: otResponse.status,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("❌ OT-NOTIFY - Error:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        source: "ot-notify-proxy"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);