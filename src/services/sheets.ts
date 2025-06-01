
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
  console.log("🔍 SHEETS - ENTRY POINT - submitToGoogleSheets called with:", data);
  console.log("🔍 SHEETS - ENTRY POINT - Order type:", data.type);
  console.log("🔍 SHEETS - ENTRY POINT - Has qtyWheels:", 'qtyWheels' in data ? data.qtyWheels : 'NO');
  console.log("🔍 SHEETS - ENTRY POINT - WEBHOOK ROUTING VERIFICATION:");
  console.log("🔍 SHEETS - ENTRY POINT - Transfer URL:", WEBHOOK_URLS.ORDERS);
  console.log("🔍 SHEETS - ENTRY POINT - MTO URL:", WEBHOOK_URLS.MTO_ORDERS);
  console.log("🔍 SHEETS - ENTRY POINT - Wheel URL:", WEBHOOK_URLS.WHEEL_ORDERS);
  
  const plant = data.plant || "Grand Prairie 97";
  console.log("🔍 SHEETS - Selected plant for webhook submission:", plant);
  
  try {
    // Map data to Google Sheets format (camelCase)
    let sheetsPayload: any;
    
    if (data.type === 'MTO') {
      sheetsPayload = mapMTOToGoogleSheets(data, user);
      console.log("🔍 SHEETS - Using MTO mapping for Google Sheets (camelCase)");
    } else {
      sheetsPayload = mapOrderToGoogleSheets(data, user);
      console.log("🔍 SHEETS - Using Order mapping for Google Sheets (camelCase)");
    }
    
    console.log("🔍 SHEETS - Mapped payload for Google Sheets:", sheetsPayload);
    
    const results = [];
    
    // For crossDock="Yes" orders, ensure we have the destination manager email
    if ('crossDock' in sheetsPayload && sheetsPayload.crossDock === "Yes" && sheetsPayload.crossDockDestination && !sheetsPayload.destinationManagerEmail) {
      const { getManagerEmail } = await import('@/components/order-form/formConfig');
      sheetsPayload.destinationManagerEmail = getManagerEmail(sheetsPayload.crossDockDestination);
      console.log("🔍 ROUTING - Added destinationManagerEmail:", sheetsPayload.destinationManagerEmail);
    }
    
    // ROUTING LOGIC - Check each condition explicitly
    console.log("🔍 ROUTING - EXPLICIT CONDITION CHECK:");
    console.log("🔍 ROUTING - data.type === 'MTO':", data.type === 'MTO');
    console.log("🔍 ROUTING - data.type === 'WHEEL_POWDER_COATING':", data.type === 'WHEEL_POWDER_COATING');
    console.log("🔍 ROUTING - 'qtyWheels' in data:", 'qtyWheels' in data);
    console.log("🔍 ROUTING - data.qtyWheels value:", 'qtyWheels' in data ? data.qtyWheels : 'NOT_PRESENT');
    
    if (data.type === 'MTO') {
      console.log("🔍 ROUTING - Processing MTO order - will use MTO webhook");
      console.log("🔍 ROUTING - MTO webhook URL:", WEBHOOK_URLS.MTO_ORDERS);
      
      const plantUrl = PLANT_WEBHOOKS[plant as keyof typeof PLANT_WEBHOOKS]?.mtoOrders;
      if (plantUrl) {
        console.log("🔍 ROUTING - Using plant-specific MTO webhook URL:", plantUrl);
        const plantWebhookResult = await submitToWebhook(plantUrl, sheetsPayload);
        results.push(plantWebhookResult);
      }
      
      console.log("🔍 ROUTING - Sending to MTO Orders Google Sheet webhook");
      const mtoOrdersResult = await submitToMTOOrdersWebhook(sheetsPayload);
      results.push(mtoOrdersResult);
    } 
    else if (data.type === 'WHEEL_POWDER_COATING' || ('qtyWheels' in data && data.qtyWheels)) {
      console.log("🔍 ROUTING - ✅ WHEEL ORDER DETECTED - ENTERING WHEEL PROCESSING BRANCH");
      console.log("🔍 ROUTING - Wheel webhook URL:", WEBHOOK_URLS.WHEEL_ORDERS);
      console.log("🔍 ROUTING - CRITICAL: Ensuring wheel order goes to Google Sheets");
      
      const plantUrl = PLANT_WEBHOOKS[plant as keyof typeof PLANT_WEBHOOKS]?.wheelOrders;
      if (plantUrl) {
        console.log("🔍 ROUTING - Using plant-specific Wheel webhook URL:", plantUrl);
        const plantWebhookResult = await submitToWebhook(plantUrl, sheetsPayload);
        results.push(plantWebhookResult);
        console.log("🔍 ROUTING - Plant wheel webhook result:", plantWebhookResult);
      }
      
      console.log("🔍 ROUTING - ✅ CRITICAL: About to call submitToWheelOrdersWebhook");
      console.log("🔍 ROUTING - ✅ CRITICAL: URL being used:", WEBHOOK_URLS.WHEEL_ORDERS);
      console.log("🔍 ROUTING - ✅ CRITICAL: Payload being sent:", sheetsPayload);
      
      const wheelOrdersResult = await submitToWheelOrdersWebhook(sheetsPayload);
      console.log("🔍 ROUTING - ✅ CRITICAL: submitToWheelOrdersWebhook returned:", wheelOrdersResult);
      results.push(wheelOrdersResult);
    }
    else {
      console.log("🔍 ROUTING - Processing TRANSFER order - will use TRANSFER webhook");
      console.log("🔍 ROUTING - Transfer webhook URL:", WEBHOOK_URLS.ORDERS);
      
      const plantUrl = PLANT_WEBHOOKS[plant as keyof typeof PLANT_WEBHOOKS]?.transferRequests;
      if (plantUrl) {
        console.log("🔍 ROUTING - Using plant-specific Transfer webhook URL:", plantUrl);
        const plantWebhookResult = await submitToWebhook(plantUrl, sheetsPayload);
        results.push(plantWebhookResult);
      }
      
      console.log("🔍 ROUTING - Sending to Transfer Orders Google Sheet webhook");
      const ordersResult = await submitToOrdersWebhook(sheetsPayload);
      results.push(ordersResult);
    }
    
    console.log("🔍 ROUTING - All webhook results:", results);
    
    // Check if at least one webhook succeeded
    if (results.some(result => result === true)) {
      console.log("🔍 ROUTING - At least one webhook triggered successfully");
      return { status: 'success' };
    } else {
      console.log("🔍 ROUTING - All webhooks failed to trigger");
      return { status: 'error' };
    }

  } catch (error) {
    console.error("❌ ROUTING - Error submitting to webhooks:", error);
    return { status: 'error' };
  }
};
