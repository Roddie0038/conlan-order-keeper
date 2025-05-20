
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
  
  // Always use the plant-specific webhook for sending notifications
  const webhookUrl = plantWebhooks[selectedPlant]?.transferRequests;
  console.log("🔍 SUBMIT - Admin using plant-specific webhook:", webhookUrl);
  
  if (webhookUrl) {
    console.log("🔍 SUBMIT - Sending to webhook:", webhookUrl);
    await submitToWebhook(webhookUrl, order);
  } else {
    console.error("❌ SUBMIT - No webhook URL found for this configuration");
  }
};
