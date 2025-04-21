import { PLANT_WEBHOOKS } from '@/contexts/PlantContext';
import { submitToWebhook } from './webhook/utils';
import { submitToOrdersWebhook } from './webhook/orderWebhook';
import { submitToWheelOrdersWebhook } from './webhook/wheelWebhook';
import { submitToMTOOrdersWebhook } from './webhook/mtoWebhook';
import { 
  OrderType, 
  OrderData, 
  MTOOrderData,
  WEBHOOK_URLS
} from './webhook/config';

export type { OrderType, OrderData, MTOOrderData };

export const submitToGoogleSheets = async (data: OrderData | MTOOrderData) => {
  console.log("🔍 SHEETS - Submitting to webhooks:", data);
  console.log("🔍 SHEETS - Manager's email in submitToGoogleSheets:", data.managersEmail || data.managerEmail);
  console.log("🔍 SHEETS - Order type:", data.type);
  console.log("🔍 SHEETS - Has qtyWheels property:", 'qtyWheels' in data);
  console.log("🔍 SHEETS - WHEEL_ORDERS URL from config:", WEBHOOK_URLS.WHEEL_ORDERS);
  console.log("🔍 SHEETS - Expected WHEEL_ORDERS URL: https://script.google.com/macros/s/AKfycbw_PHHn33ELTWnvQHG49VWew18L11EKaF0nHbMFLZvT2C_CNOLs-smLd4aHNxDF7CIEQA/exec");
  
  // Ensure a plant is specified, default to Grand Prairie 97 if not
  const plant = data.plant || "Grand Prairie 97";
  console.log("🔍 SHEETS - Selected plant for webhook submission:", plant);
  
  try {
    // Create an array to hold our promise results
    const results = [];
    
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
      
      // If Grand Prairie, send to both Zapier and Orders webhooks
      if (plant === "Grand Prairie 97") {
        // 1. Send to the special Zapier webhook
        const zapierUrl = "https://hooks.zapier.com/hooks/catch/21741437/2wk9kll/";
        console.log("🔍 ROUTING - Also sending order to GP Zapier webhook:", zapierUrl);
        const zapierResult = await submitToWebhook(zapierUrl, data);
        results.push(zapierResult);

        // 2. Send to Orders (Google Sheets) webhook as normal
        const ordersResult = await submitToOrdersWebhook(data);
        results.push(ordersResult);

        // 3. Still send to the plant's transferRequests as normal for backward compatibility if you want:
        const plantUrl = PLANT_WEBHOOKS[plant as keyof typeof PLANT_WEBHOOKS].transferRequests;
        if (plantUrl && plantUrl !== zapierUrl) {
          console.log("🔍 ROUTING - Sending to plant-specific GP Transfer webhook:", plantUrl);
          const plantResult = await submitToWebhook(plantUrl, data);
          results.push(plantResult);
        }

        console.log("🔍 ROUTING - Grand Prairie order processed completely to both endpoints");
      } else {
        // Default to TRANSFER type for other plants: plant transfer AND Orders webhook
        const plantUrl = PLANT_WEBHOOKS[plant as keyof typeof PLANT_WEBHOOKS].transferRequests;
        console.log("🔍 ROUTING - Using plant-specific Transfer webhook URL:", plantUrl);
        const plantWebhookResult = await submitToWebhook(plantUrl, data);
        results.push(plantWebhookResult);

        // Send to the new Orders webhook
        console.log("🔍 ROUTING - Sending to Orders Google Sheet webhook");
        const ordersResult = await submitToOrdersWebhook(data);
        results.push(ordersResult);

        console.log("🔍 ROUTING - Transfer order processed completely for non-GP plant");
      }
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
