
import { supabase } from "@/integrations/supabase/client";
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
    console.log('🚀 WARRANTY SERVICE - Submitting retread warranty claim:', data);
    
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
      console.error('❌ WARRANTY SERVICE - Database error:', dbError);
      return { data: null, error: new Error(`Database error: ${dbError.message}`) };
    }

    console.log('✅ WARRANTY SERVICE - Warranty claim saved to database:', warrantyOrder);

    // Extract store number for proper routing
    const storeNumber = data.store.match(/\d+$/)?.[0] || "";
    console.log('📧 WARRANTY SERVICE - Store number extracted:', storeNumber);
    
    // Trigger warranty-specific email notification via edge function
    console.log('📧 WARRANTY SERVICE - Calling warranty-notification edge function');
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
          warrantyId: warrantyOrder.id
        })
      }
    );

    if (!emailResponse.ok) {
      const emailError = await emailResponse.text();
      console.error('❌ WARRANTY SERVICE - Email notification failed:', emailError);
      // Don't throw error here - warranty was saved successfully
    } else {
      const emailResult = await emailResponse.json();
      console.log('✅ WARRANTY SERVICE - Email notification sent successfully:', emailResult);
    }

    return { data: warrantyOrder, error: null };
  } catch (error) {
    console.error('❌ WARRANTY SERVICE - Error submitting warranty claim:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error("Unknown error in warranty submission") 
    };
  }
};
