
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

// Type guard to check if the data is an OrderData (with CrossDock fields)
function isOrderData(data: OrderData | MTOOrderData): data is OrderData {
  return 'yourName' in data && !('casingGrade' in data);
}

// Type guard to check if the data is an MTOOrderData
function isMTOOrderData(data: OrderData | MTOOrderData): data is MTOOrderData {
  return 'casingGrade' in data;
}

export const submitToGoogleSheets = async (data: OrderData | MTOOrderData) => {
  console.log("🔍 SHEETS - Submitting to webhooks:", data);
  console.log("🔍 SHEETS - Manager's email in submitToGoogleSheets:", data.managersEmail || data.managerEmail);
  console.log("🔍 SHEETS - Order type:", data.type);
  
  const plant = data.plant || "Grand Prairie 97";
  console.log("🔍 SHEETS - Selected plant for webhook submission:", plant);
  console.log("🔍 SHEETS - All plant webhooks:", PLANT_WEBHOOKS);
  console.log("🔍 SHEETS - Plant webhook for selected plant:", PLANT_WEBHOOKS[plant as keyof typeof PLANT_WEBHOOKS]);
  
  try {
    const results = [];
    
    // For crossDock="Yes" orders, ensure we have the destination manager email
    // Only check this for OrderData types, not MTOOrderData
    if (isOrderData(data) && data.crossDock === "Yes" && data.crossDockDestination && !data.destinationManagerEmail) {
      // Import directly here to avoid circular dependency
      const { getManagerEmail } = await import('@/components/order-form/formConfig');
      data.destinationManagerEmail = getManagerEmail(data.crossDockDestination);
      console.log("🔍 ROUTING - Added destinationManagerEmail:", data.destinationManagerEmail);
    }
    
    // Determine which type of order it is and submit to appropriate webhooks
    if (data.type === 'MTO') {
      console.log("🔍 ROUTING - Processing MTO order");
      
      // Send to the plant-specific MTO webhook
      const plantUrl = PLANT_WEBHOOKS[plant as keyof typeof PLANT_WEBHOOKS]?.mtoOrders;
      if (plantUrl) {
        console.log("🔍 ROUTING - Using plant-specific MTO webhook URL:", plantUrl);
        const plantWebhookResult = await submitToWebhook(plantUrl, data);
        results.push(plantWebhookResult);
      } else {
        console.log("⚠️ ROUTING - No plant-specific MTO webhook URL found for plant:", plant);
      }
      
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
      const plantUrl = PLANT_WEBHOOKS[plant as keyof typeof PLANT_WEBHOOKS]?.wheelOrders;
      if (plantUrl) {
        console.log("🔍 ROUTING - Using plant-specific Wheel webhook URL:", plantUrl);
        const plantWebhookResult = await submitToWebhook(plantUrl, data);
        results.push(plantWebhookResult);
      } else {
        console.log("⚠️ ROUTING - No plant-specific Wheel webhook URL found for plant:", plant);
      }
      
      // Send to the Wheel Orders webhook
      console.log("🔍 ROUTING - Sending to Wheel Orders Google Sheet webhook");
      const wheelOrdersResult = await submitToWheelOrdersWebhook(data);
      results.push(wheelOrdersResult);
      
      console.log("🔍 ROUTING - Wheel order processed completely");
    }
    else {
      console.log("🔍 ROUTING - Processing regular TRANSFER order");
      console.log("🔍 ROUTING - Using updated webhook URL for transfer orders");
      
      // Send to the plant-specific webhook
      const plantUrl = PLANT_WEBHOOKS[plant as keyof typeof PLANT_WEBHOOKS]?.transferRequests;
      if (plantUrl) {
        console.log("🔍 ROUTING - Using plant-specific Transfer webhook URL:", plantUrl);
        console.log("🔍 ROUTING - Plant URL for transferRequests:", plantUrl);
        const plantWebhookResult = await submitToWebhook(plantUrl, data);
        results.push(plantWebhookResult);
        console.log("🔍 ROUTING - Plant webhook submission result:", plantWebhookResult);
      } else {
        console.error("❌ ROUTING - No plant-specific webhook URL found for:", plant);
      }
      
      // Send to the new Orders webhook
      console.log("🔍 ROUTING - Sending to Orders Google Sheet webhook");
      const ordersResult = await submitToOrdersWebhook(data);
      results.push(ordersResult);
      console.log("🔍 ROUTING - Orders webhook submission result:", ordersResult);
      
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
