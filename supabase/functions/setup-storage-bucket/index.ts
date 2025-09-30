
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create Supabase admin client for managing buckets
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      throw new Error(`Error checking buckets: ${listError.message}`);
    }

    let response = { message: "", status: 200 };

    // If bucket doesn't exist, create it
    if (!buckets.some(bucket => bucket.name === "inventory-docs")) {
      const { data, error: createError } = await supabase.storage.createBucket(
        "inventory-docs",
        {
          public: false,
          fileSizeLimit: 52428800, // 50MB
        }
      );

      if (createError) {
        throw new Error(`Error creating bucket: ${createError.message}`);
      }

      // Create RLS policies for the bucket
      const { error: policyError } = await supabase.rpc("create_storage_policy", {
        bucket_name: "inventory-docs",
      });

      if (policyError) {
        console.error("Error creating policies:", policyError);
        // Continue even if policy creation fails
      }

      response = {
        message: "Inventory document storage bucket created successfully",
        status: 201,
      };
    } else {
      response = {
        message: "Inventory document storage bucket already exists",
        status: 200,
      };
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: response.status,
    });
  } catch (error) {
    console.error("Error in setup-storage-bucket function:", error);

    return new Response(
      JSON.stringify({
        error: (error as Error).message || "An error occurred while setting up the storage bucket",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
