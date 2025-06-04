
import { supabase } from "@/integrations/supabase/client";
import { getWarrantyEmailRecipients } from "@/config/contactSystem";
import type { SupabaseInsertResult, WarrantyOrderRecord } from "@/types/supabase-extensions";

export interface RetreadWarrantyData {
  plant: string;
  store: string;
  tire_type: string;
  dot_number: string;
  condition: string;
  notes?: string;
  customer_name: string;
  work_order: string;
  tire_size?: string;
  invoice_url: string;
  photo_urls: string[];
  email: string;
  name: string;
}

export const submitRetreadWarranty = async (data: RetreadWarrantyData): Promise<SupabaseInsertResult<WarrantyOrderRecord>> => {
  try {
    console.log('🚀 Submitting retread warranty claim:', data);
    
    // Insert into warranty_orders table
    const { data: warrantyOrder, error: dbError } = await supabase
      .from('warranty_orders')
      .insert({
        plant: data.plant,
        store: data.store,
        tire_type: data.tire_type,
        dot_number: data.dot_number,
        condition: data.condition,
        notes: data.notes,
        customer_name: data.customer_name,
        work_order: data.work_order,
        tire_size: data.tire_size,
        invoice_url: data.invoice_url,
        photo_urls: data.photo_urls,
        email: data.email,
        name: data.name,
        status: 'open',
        date_submitted: new Date().toISOString().split('T')[0]
      })
      .select()
      .single();

    if (dbError) {
      console.error('❌ Database error:', dbError);
      return { data: null, error: new Error(`Database error: ${dbError.message}`) };
    }

    console.log('✅ Warranty claim saved to database:', warrantyOrder);

    // Get store number for routing
    const storeNumber = data.store.match(/\d+$/)?.[0] || "";
    
    // Use new contact system for email routing
    let emailRecipients: string[] = [];
    
    if (storeNumber && !["22", "27", "28", "29", "30", "32", "33", "35", "36", "39"].includes(storeNumber)) {
      // Use new contact system for non-Grand Prairie stores
      emailRecipients = getWarrantyEmailRecipients(storeNumber);
      console.log('🔍 WARRANTY - Using new contact system for store:', storeNumber, 'Recipients:', emailRecipients);
    } else {
      // Keep existing Grand Prairie logic unchanged
      emailRecipients = [data.email]; // Fallback to submitter email
      console.log('🔍 WARRANTY - Using existing Grand Prairie logic for store:', storeNumber);
    }

    // Trigger email notification via edge function
    const emailResponse = await fetch(
      `https://cdbixtaqjppvdkyfbhkz.supabase.co/functions/v1/warranty-notification`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkYml4dGFxanBwdmRreWZiaGt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMzcwNjEsImV4cCI6MjA1NTkxMzA2MX0.mkeq7GvLjzw8om8t9mnlLLozHimoYy-HsRgJ65RRc10`
        },
        body: JSON.stringify({
          warrantyData: data,
          warrantyId: warrantyOrder.id,
          customRecipients: emailRecipients.length > 0 ? emailRecipients : undefined
        })
      }
    );

    if (!emailResponse.ok) {
      console.error('❌ Email notification failed:', await emailResponse.text());
      // Don't throw error here - warranty was saved successfully
    } else {
      console.log('✅ Email notification sent successfully');
    }

    return { data: warrantyOrder, error: null };
  } catch (error) {
    console.error('❌ Error submitting warranty claim:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error("Unknown error in warranty submission") 
    };
  }
};
