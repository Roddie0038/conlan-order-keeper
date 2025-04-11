
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
  console.log("Submitting to webhooks:", data);
  console.log("Manager's email in submitToGoogleSheets:", data.managersEmail || data.managerEmail);
  console.log("Order type:", data.type);
  console.log("Has qtyWheels property:", 'qtyWheels' in data);
  
  // Ensure a plant is specified, default to Grand Prairie 97 if not
  const plant = data.plant || "Grand Prairie 97";
  console.log("Selected plant for webhook submission:", plant);
  
  try {
    // Create an array to hold our promise results
    const results = [];
    
    // Determine which type of order it is and submit to appropriate webhooks
    if (data.type === 'MTO') {
      console.log("🔍 ROUTING - Processing MTO order");
      
      // Send to the plant-specific MTO webhook
      const plantUrl = PLANT_WEBHOOKS[plant as keyof typeof PLANT_WEBHOOKS].mtoOrders;
      console.log("Using plant-specific MTO webhook URL:", plantUrl);
      const plantWebhookResult = await submitToWebhook(plantUrl, data);
      results.push(plantWebhookResult);
      
      // Send to the new MTO Orders webhook
      console.log("Sending to MTO Orders Google Sheet webhook");
      const mtoOrdersResult = await submitToMTOOrdersWebhook(data);
      results.push(mtoOrdersResult);
    } 
    else if (data.type === 'WHEEL_POWDER_COATING' || ('qtyWheels' in data && data.qtyWheels)) {
      console.log("🔍 ROUTING - Processing WHEEL order");
      
      // Always ensure type is set to WHEEL_POWDER_COATING for consistency
      data.type = 'WHEEL_POWDER_COATING';
      
      // Send to the plant-specific Wheel Orders webhook
      const plantUrl = PLANT_WEBHOOKS[plant as keyof typeof PLANT_WEBHOOKS].wheelOrders;
      console.log("Using plant-specific Wheel webhook URL:", plantUrl);
      const plantWebhookResult = await submitToWebhook(plantUrl, data);
      results.push(plantWebhookResult);
      
      // Send to the Wheel Orders webhook
      console.log("Sending to Wheel Orders Google Sheet webhook");
      console.log("WHEEL_ORDERS URL:", WEBHOOK_URLS.WHEEL_ORDERS);
      const wheelOrdersResult = await submitToWheelOrdersWebhook(data);
      results.push(wheelOrdersResult);
      
      // Explicitly log that we're NOT sending to MTO webhook for wheel orders
      console.log("✅ NOT sending wheel order to MTO webhook - correct routing");
    }
    else {
      console.log("🔍 ROUTING - Processing regular TRANSFER order");
      
      // Default to TRANSFER type for regular orders
      // Send to the plant-specific webhook
      const plantUrl = PLANT_WEBHOOKS[plant as keyof typeof PLANT_WEBHOOKS].transferRequests;
      console.log("Using plant-specific Transfer webhook URL:", plantUrl);
      const plantWebhookResult = await submitToWebhook(plantUrl, data);
      results.push(plantWebhookResult);
      
      // Send to the new Orders webhook
      console.log("Sending to Orders Google Sheet webhook");
      const ordersResult = await submitToOrdersWebhook(data);
      results.push(ordersResult);
    }
    
    // Check if at least one webhook succeeded
    if (results.some(result => result === true)) {
      console.log("At least one webhook triggered successfully");
      return { status: 'success' };
    } else {
      console.log("All webhooks failed to trigger");
      return { status: 'error' };
    }

  } catch (error) {
    console.error("Error submitting to webhooks:", error);
    return { status: 'error' };
  }
};
