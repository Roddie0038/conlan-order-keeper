
// Function to format dates for webhook submissions
export function formatDate(date: string | Date): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toISOString().split("T")[0]; // yyyy-mm-dd format
}

// Function to prepare data before sending to webhook
export const prepareWebhookData = (data: any) => {
  // Clone the data to avoid modifying the original
  const formattedData = { ...data };
  
  // Format any date fields if needed
  if (formattedData.dateReceived) {
    formattedData.dateReceived = formatDate(formattedData.dateReceived);
  }
  
  if (formattedData.scheduleArrival && !(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Will Call Pick Up)$/i.test(formattedData.scheduleArrival))) {
    formattedData.scheduleArrival = formatDate(formattedData.scheduleArrival);
  }
  
  return formattedData;
};

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
