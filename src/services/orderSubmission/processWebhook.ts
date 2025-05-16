
import { OrderSummary } from "@/hooks/useOrderSubmission";
import { submitToWebhook } from "@/services/webhook/utils";

/**
 * Process webhook submission for an order (admin only)
 * 
 * @param order - The order to send via webhook
 * @param testMode - Whether to use test mode webhooks
 * @param isAdmin - Whether the current user is an admin
 * @param selectedPlant - The currently selected plant
 * @param plantWebhooks - Configuration object for plant-specific webhooks
 */
export const processWebhook = async (
  order: OrderSummary, 
  testMode: boolean, 
  isAdmin: boolean,
  selectedPlant: string,
  plantWebhooks: Record<string, Record<string, string>>
) => {
  if (!isAdmin) return;
  
  console.log("🔍 SUBMIT - Admin user submitting order to plant:", selectedPlant);
  
  let webhookUrl;
  if (testMode) {
    // Use the plant-specific webhook for test mode
    webhookUrl = plantWebhooks[selectedPlant]?.transferRequests;
    console.log("🔍 SUBMIT - Admin in test mode, using plant-specific webhook:", webhookUrl);
  } else {
    // Use the admin-specific webhook for production mode
    webhookUrl = plantWebhooks[selectedPlant]?.adminOrders;
    console.log("🔍 SUBMIT - Admin in production mode, using admin webhook:", webhookUrl);
  }
  
  if (webhookUrl) {
    console.log("🔍 SUBMIT - Sending to webhook:", webhookUrl);
    await submitToWebhook(webhookUrl, order);
  } else {
    console.error("❌ SUBMIT - No webhook URL found for this configuration");
  }
};
