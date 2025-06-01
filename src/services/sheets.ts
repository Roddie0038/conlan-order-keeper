
import { PLANT_WEBHOOKS } from '@/contexts/PlantContext';
import { submitToWebhook } from './webhook/utils';
import { submitToOrdersWebhook } from './webhook/orderWebhook';
import { submitToWheelOrdersWebhook } from './webhook/wheelWebhook';
import { submitToMTOOrdersWebhook } from './webhook/mtoWebhook';
import { OrderType, MTOOrderData, WEBHOOK_URLS } from './webhook/config';
import type { OrderData } from '@/types/supabase-extensions';
import { mapOrderToGoogleSheets } from '@/utils/mapOrderToGoogleSheets';
import { mapMTOToGoogleSheets } from '@/utils/mapMTOToGoogleSheets';

export type { OrderType, MTOOrderData };
export type { OrderData };

export const submitToGoogleSheets = async (data: OrderData | MTOOrderData, user?: any) => {
  console.log("🔍 SHEETS - ENTRY POINT - submitToGoogleSheets called");
  console.log("🔍 SHEETS - Order data:", JSON.stringify(data, null, 2));
  console.log("🔍 SHEETS - Order type:", data.type);
  console.log("🔍 SHEETS - Has qtyWheels:", 'qtyWheels' in data ? data.qtyWheels : 'NO');
  
  const plant = data.plant || "Grand Prairie 97";
  console.log("🔍 SHEETS - Selected plant:", plant);
  
  try {
    const results = [];
    
    // EXPLICIT ROUTING LOGIC
    console.log("🔍 SHEETS - ROUTING DECISION:");
    console.log("🔍 SHEETS - data.type === 'MTO':", data.type === 'MTO');
    console.log("🔍 SHEETS - data.type === 'WHEEL_POWDER_COATING':", data.type === 'WHEEL_POWDER_COATING');
    console.log("🔍 SHEETS - 'qtyWheels' in data:", 'qtyWheels' in data);
    console.log("🔍 SHEETS - data.qtyWheels value:", 'qtyWheels' in data ? data.qtyWheels : 'NOT_PRESENT');
    
    if (data.type === 'MTO') {
      console.log("🔍 SHEETS - ROUTING: MTO Order - Using MTO webhook");
      
      // Map data to Google Sheets format for MTO
      const sheetsPayload = mapMTOToGoogleSheets(data, user);
      console.log("🔍 SHEETS - MTO mapped payload:", JSON.stringify(sheetsPayload, null, 2));
      
      const plantUrl = PLANT_WEBHOOKS[plant as keyof typeof PLANT_WEBHOOKS]?.mtoOrders;
      if (plantUrl) {
        console.log("🔍 SHEETS - Plant MTO webhook URL:", plantUrl);
        const plantWebhookResult = await submitToWebhook(plantUrl, sheetsPayload);
        results.push(plantWebhookResult);
      }
      
      const mtoOrdersResult = await submitToMTOOrdersWebhook(sheetsPayload);
      results.push(mtoOrdersResult);
    } 
    else if (data.type === 'WHEEL_POWDER_COATING' || ('qtyWheels' in data && data.qtyWheels)) {
      console.log("🚀 SHEETS - ROUTING: WHEEL ORDER DETECTED - Using WHEEL webhook");
      console.log("🚀 SHEETS - CRITICAL: Passing ORIGINAL wheel data (NO generic mapping)");
      console.log("🚀 SHEETS - Original wheel data being passed:", JSON.stringify(data, null, 2));
      
      // CRITICAL FIX: For wheel orders, pass the original data directly to preserve all wheel-specific fields
      // DO NOT use mapOrderToGoogleSheets as it strips wheel-specific fields
      
      const plantUrl = PLANT_WEBHOOKS[plant as keyof typeof PLANT_WEBHOOKS]?.wheelOrders;
      if (plantUrl) {
        console.log("🔍 SHEETS - Plant wheel webhook URL:", plantUrl);
        const plantWebhookResult = await submitToWebhook(plantUrl, data);
        results.push(plantWebhookResult);
      }
      
      console.log("🚀 SHEETS - CRITICAL: Calling submitToWheelOrdersWebhook with ORIGINAL data");
      const wheelOrdersResult = await submitToWheelOrdersWebhook(data);
      console.log("🚀 SHEETS - submitToWheelOrdersWebhook returned:", wheelOrdersResult);
      results.push(wheelOrdersResult);
    }
    else {
      console.log("🔍 SHEETS - ROUTING: TRANSFER Order - Using TRANSFER webhook");
      
      // Map data to Google Sheets format for transfer orders
      let sheetsPayload = mapOrderToGoogleSheets(data, user);
      console.log("🔍 SHEETS - Transfer mapped payload:", JSON.stringify(sheetsPayload, null, 2));
      
      // For crossDock="Yes" orders, ensure we have the destination manager email
      if ('crossDock' in sheetsPayload && sheetsPayload.crossDock === "Yes" && sheetsPayload.crossDockDestination && !sheetsPayload.destinationManagerEmail) {
        const { getManagerEmail } = await import('@/components/order-form/formConfig');
        sheetsPayload.destinationManagerEmail = getManagerEmail(sheetsPayload.crossDockDestination);
        console.log("🔍 SHEETS - Added destinationManagerEmail:", sheetsPayload.destinationManagerEmail);
      }
      
      const plantUrl = PLANT_WEBHOOKS[plant as keyof typeof PLANT_WEBHOOKS]?.transferRequests;
      if (plantUrl) {
        console.log("🔍 SHEETS - Plant transfer webhook URL:", plantUrl);
        const plantWebhookResult = await submitToWebhook(plantUrl, sheetsPayload);
        results.push(plantWebhookResult);
      }
      
      const ordersResult = await submitToOrdersWebhook(sheetsPayload);
      results.push(ordersResult);
    }
    
    console.log("🔍 SHEETS - All webhook results:", results);
    
    // Check if at least one webhook succeeded
    if (results.some(result => result === true)) {
      console.log("✅ SHEETS - At least one webhook succeeded");
      return { status: 'success' };
    } else {
      console.log("❌ SHEETS - All webhooks failed");
      return { status: 'error' };
    }

  } catch (error) {
    console.error("❌ SHEETS - Error submitting to webhooks:", error);
    return { status: 'error' };
  }
};
