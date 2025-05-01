
import { PLANT_WEBHOOKS } from '@/contexts/PlantContext';
import { submitToWebhook } from './webhook/utils';
import { submitToOrdersWebhook } from './webhook/orderWebhook';
import { submitToWheelOrdersWebhook } from './webhook/wheelWebhook';
import { submitToMTOOrdersWebhook } from './webhook/mtoWebhook';
import { 
  OrderType, 
  OrderData, 
  MTOOrderData,
  WEBHOOK_URLS,
  ADDITIONAL_WEBHOOKS
} from './webhook/config';

export type { OrderType, OrderData, MTOOrderData };

export const submitToGoogleSheets = async (data: OrderData | MTOOrderData) => {
  console.log("🔍 SHEETS - Submitting to webhooks:", data);
  console.log("🔍 SHEETS - Manager's email in submitToGoogleSheets:", data.managersEmail || data.managerEmail);
  console.log("🔍 SHEETS - Order type:", data.type);
  
  const plant = data.plant || "Grand Prairie 97";
  console.log("🔍 SHEETS - Selected plant for webhook submission:", plant);
  
  try {
    const results = [];
    
    // If the plant is Grand Prairie 97, send to the additional webhook
    if (plant === "Grand Prairie 97") {
      console.log("🔍 ROUTING - Sending to GP97 additional webhook");
      const gp97Result = await fetch(ADDITIONAL_WEBHOOKS.GP97_ORDERS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      results.push(gp97Result.ok);
    }
    
    // For crossDock="Yes" orders, ensure we have the destination manager email
    if (data.crossDock === "Yes" && data.crossDockDestination && !data.destinationManagerEmail) {
      // Import directly here to avoid circular dependency
      const { getManagerEmail } = await import('@/components/order-form/formConfig');
      data.destinationManagerEmail = getManagerEmail(data.crossDockDestination);
      console.log("🔍 ROUTING - Added destinationManagerEmail:", data.destinationManagerEmail);
    }
    
    // Determine which type of order it is and submit to appropriate webhooks
    if (data.type === 'MTO') {
      console.log("🔍 ROUTING - Processing MTO order");
      
      // Send to the plant-specific MTO webhook
      const plantUrl = PLANT_WEBHOOKS[plant as keyof typeof PLANT_WEBHOOKS].mtoOrders;
      console.log("🔍 ROUTING - Using plant-specific MTO webhook URL:", plantUrl);
      const plantWebhookResult = await submitToWebhook(plantUrl, data);
      results.push(plantWebhookResult);
      
      // Send to the new MTO Orders webhook
      console.log("🔍 ROUTING - Sending to MTO Orders Google Sheet webhook");
      const mtoOrdersResult = await submitToMTOOrdersWebhook(data);
      results.push(mtoOrdersResult);
      
      console.log("🔍 ROUTING - MTO order processed completely");
    } 
    else if (data.type === 'WHEEL_POWDER_COATING' || ('qtyWheels' in data && data.qtyWheels)) {
      console.log("🔍 ROUTING - Processing WHEEL order");
      console.log("🔍 ROUTING - Wheel order detected because:", {
        typeIsWheel: data.type === 'WHEEL_POWDER_COATING',
        hasQtyWheels: 'qtyWheels' in data && Boolean(data.qtyWheels)
      });
      
      // Always ensure type is set to WHEEL_POWDER_COATING for consistency
      data.type = 'WHEEL_POWDER_COATING';
      
      // Send to the plant-specific Wheel Orders webhook
      const plantUrl = PLANT_WEBHOOKS[plant as keyof typeof PLANT_WEBHOOKS].wheelOrders;
      console.log("🔍 ROUTING - Using plant-specific Wheel webhook URL:", plantUrl);
      const plantWebhookResult = await submitToWebhook(plantUrl, data);
      results.push(plantWebhookResult);
      
      // Send to the Wheel Orders webhook
      console.log("🔍 ROUTING - Sending to Wheel Orders Google Sheet webhook");
      console.log("🔍 ROUTING - WHEEL_ORDERS URL:", WEBHOOK_URLS.WHEEL_ORDERS);
      console.log("🔍 ROUTING - Expected URL: https://script.google.com/macros/s/AKfycbw_PHHn33ELTWnvQHG49VWew18L11EKaF0nHbMFLZvT2C_CNOLs-smLd4aHNxDF7CIEQA/exec");
      console.log("🔍 ROUTING - URLs match?", WEBHOOK_URLS.WHEEL_ORDERS === "https://script.google.com/macros/s/AKfycbw_PHHn33ELTWnvQHG49VWew18L11EKaF0nHbMFLZvT2C_CNOLs-smLd4aHNxDF7CIEQA/exec");
      
      const wheelOrdersResult = await submitToWheelOrdersWebhook(data);
      results.push(wheelOrdersResult);
      
      // Explicitly log that we're NOT sending to MTO webhook for wheel orders
      console.log("✅ ROUTING - NOT sending wheel order to MTO webhook - correct routing");
      console.log("🔍 ROUTING - Wheel order processed completely");
    }
    else {
      console.log("🔍 ROUTING - Processing regular TRANSFER order");
      
      // Default to TRANSFER type for regular orders
      // Send to the plant-specific webhook
      const plantUrl = PLANT_WEBHOOKS[plant as keyof typeof PLANT_WEBHOOKS].transferRequests;
      console.log("🔍 ROUTING - Using plant-specific Transfer webhook URL:", plantUrl);
      const plantWebhookResult = await submitToWebhook(plantUrl, data);
      results.push(plantWebhookResult);
      
      // Send to the new Orders webhook
      console.log("🔍 ROUTING - Sending to Orders Google Sheet webhook");
      const ordersResult = await submitToOrdersWebhook(data);
      results.push(ordersResult);
      
      console.log("🔍 ROUTING - Transfer order processed completely");
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
