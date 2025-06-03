
import { supabase } from "@/integrations/supabase/client";

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

export interface NationalWarrantyData {
  plant: string;
  store: string;
  tire_type: string;
  customer_name: string;
  work_order: string;
  vehicle_make: string;
  vin_or_unit: string;
  model_year: string;
  purchase_date: string;
  wheel_position: string;
  dot_number: string;
  tire_size: string;
  load_range: string;
  wear_percentage: string;
  mileage_on_tire: string;
  condition: string;
  excise_tax_collected: boolean;
  replacement_product_code?: string;
  notes?: string;
  signature_url: string;
  photo_urls: string[];
  email: string;
  name: string;
}

export const submitRetreadWarranty = async (data: RetreadWarrantyData) => {
  try {
    console.log('🚀 Submitting retread warranty claim:', data);
    
    // Insert into warranty_orders table without user_id to avoid UUID error
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
      throw new Error(`Database error: ${dbError.message}`);
    }

    console.log('✅ Warranty claim saved to database:', warrantyOrder);

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
          warrantyId: warrantyOrder.id
        })
      }
    );

    if (!emailResponse.ok) {
      console.error('❌ Email notification failed:', await emailResponse.text());
      // Don't throw error here - warranty was saved successfully
    } else {
      console.log('✅ Email notification sent successfully');
    }

    return warrantyOrder;
  } catch (error) {
    console.error('❌ Error submitting warranty claim:', error);
    throw error;
  }
};

export const submitNationalWarranty = async (data: NationalWarrantyData) => {
  try {
    console.log('🚀 Submitting National Account warranty claim:', data);
    
    // Insert into warranty_orders table without user_id to avoid UUID error
    const { data: warrantyOrder, error: dbError } = await supabase
      .from('warranty_orders')
      .insert({
        plant: data.plant,
        store: data.store,
        tire_type: data.tire_type,
        customer_name: data.customer_name,
        work_order: data.work_order,
        vehicle_make: data.vehicle_make,
        vin_or_unit: data.vin_or_unit,
        model_year: data.model_year,
        purchase_date: data.purchase_date,
        wheel_position: data.wheel_position,
        dot_number: data.dot_number,
        tire_size: data.tire_size,
        load_range: data.load_range,
        wear_percentage: data.wear_percentage,
        mileage_on_tire: data.mileage_on_tire,
        condition: data.condition,
        excise_tax_collected: data.excise_tax_collected,
        replacement_product_code: data.replacement_product_code,
        notes: data.notes,
        signature_url: data.signature_url,
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
      throw new Error(`Database error: ${dbError.message}`);
    }

    console.log('✅ National Account warranty claim saved to database:', warrantyOrder);

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
          warrantyType: 'national'
        })
      }
    );

    if (!emailResponse.ok) {
      console.error('❌ Email notification failed:', await emailResponse.text());
      // Don't throw error here - warranty was saved successfully
    } else {
      console.log('✅ National Account email notification sent successfully');
    }

    return warrantyOrder;
  } catch (error) {
    console.error('❌ Error submitting National Account warranty claim:', error);
    throw error;
  }
};
