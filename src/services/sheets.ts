
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
  console.log("🔍 SHEETS - Submitting to webhooks:", data);
  console.log("🔍 SHEETS - Manager's email in submitToGoogleSheets:", data.email);
  console.log("🔍 SHEETS - Order type:", data.type);
  
  const plant = data.plant || "Grand Prairie 97";
  console.log("🔍 SHEETS - Selected plant for webhook submission:", plant);
  
  try {
    // Map data to Google Sheets format (camelCase)
    let sheetsPayload: any;
    
    if (data.type === 'MTO') {
      sheetsPayload = mapMTOToGoogleSheets(data, user);
    } else {
      sheetsPayload = mapOrderToGoogleSheets(data, user);
    }
    
    console.log("🔍 SHEETS - Mapped payload for Google Sheets:", sheetsPayload);
    
    const results = [];
    
    // For crossDock="Yes" orders, ensure we have the destination manager email
    if ('crossDock' in sheetsPayload && sheetsPayload.crossDock === "Yes" && sheetsPayload.crossDockDestination && !sheetsPayload.destinationManagerEmail) {
      const { getManagerEmail } = await import('@/components/order-form/formConfig');
      sheetsPayload.destinationManagerEmail = getManagerEmail(sheetsPayload.crossDockDestination);
      console.log("🔍 ROUTING - Added destinationManagerEmail:", sheetsPayload.destinationManagerEmail);
    }
    
    // Route based on order type
    if (data.type === 'MTO') {
      console.log("🔍 ROUTING - Processing MTO order");
      
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
      console.log("🔍 ROUTING - Processing WHEEL order");
      
      const plantUrl = PLANT_WEBHOOKS[plant as keyof typeof PLANT_WEBHOOKS]?.wheelOrders;
      if (plantUrl) {
        console.log("🔍 ROUTING - Using plant-specific Wheel webhook URL:", plantUrl);
        const plantWebhookResult = await submitToWebhook(plantUrl, sheetsPayload);
        results.push(plantWebhookResult);
      }
      
      console.log("🔍 ROUTING - Sending to Wheel Orders Google Sheet webhook");
      const wheelOrdersResult = await submitToWheelOrdersWebhook(sheetsPayload);
      results.push(wheelOrdersResult);
    }
    else {
      console.log("🔍 ROUTING - Processing regular TRANSFER order");
      
      const plantUrl = PLANT_WEBHOOKS[plant as keyof typeof PLANT_WEBHOOKS]?.transferRequests;
      if (plantUrl) {
        console.log("🔍 ROUTING - Using plant-specific Transfer webhook URL:", plantUrl);
        const plantWebhookResult = await submitToWebhook(plantUrl, sheetsPayload);
        results.push(plantWebhookResult);
      }
      
      console.log("🔍 ROUTING - Sending to Orders Google Sheet webhook");
      const ordersResult = await submitToOrdersWebhook(sheetsPayload);
      results.push(ordersResult);
    }
    
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
