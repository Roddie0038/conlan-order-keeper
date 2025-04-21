
import { formatDate } from './utils';

export const submitToWebhook = async (url: string, data: any) => {
  try {
    // Format the data before sending
    const formattedData = prepareWebhookData(data);

    console.log("📤 WEBHOOK - Full payload being sent:", JSON.stringify(formattedData, null, 2));
    console.log("📤 WEBHOOK - Using webhook URL:", url);
    
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData)
      });
      
      console.log(`📥 WEBHOOK - Response status:`, response.status);
      
      // Try to read the response body regardless of status
      try {
        const responseText = await response.text();
        console.log(`📥 WEBHOOK - Full response body:`, responseText);
      } catch (bodyReadError) {
        console.warn(`⚠️ WEBHOOK - Could not read response body:`, bodyReadError);
      }
      
      if (!response.ok) {
        console.error(`❌ WEBHOOK - Non-OK response. Status: ${response.status}`);
        return false;
      }
      
      console.log(`✅ WEBHOOK - Successfully triggered webhook`);
      return true;
    } catch (fetchError) {
      console.error(`❌ WEBHOOK - Fetch error:`, fetchError);
      return false;
    }
  } catch (error) {
    console.error(`❌ WEBHOOK - Unexpected error triggering webhook ${url}:`, error);
    return false;
  }
};

