
/**
 * Utility functions for webhook submissions
 */

/**
 * Formats a date string to YYYY-MM-DD format
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    // Format as YYYY-MM-DD
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString; // Return original string if parsing fails
  }
};

/**
 * Prepares common data for webhook submission
 */
export const prepareWebhookData = (data: any) => {
  // Check if scheduleArrival is a weekday name and preserve it
  const isWeekdayName = /^(Monday|Tuesday|Wednesday|Thursday|Friday|Will Call Pick Up)$/i.test(data.scheduleArrival);
  
  return {
    ...data,
    // Only format dateReceived, leave scheduleArrival as is if it's a weekday name
    dateReceived: data.dateReceived ? formatDate(data.dateReceived) : formatDate(new Date().toISOString()),
    timestamp: new Date().toISOString(),
    orderId: crypto.randomUUID(),
    triggered_from: window.location.origin,
    // Ensure manager's email is included with the consistent property name
    managersEmail: data.managerEmail || data.managersEmail,
    managerEmail: data.managerEmail || data.managersEmail,
    // Join multiple casing grades into a comma-separated string if it's an array
    casingGrade: Array.isArray(data.casingGrade) ? data.casingGrade.join(', ') : data.casingGrade,
    // Preserve weekday names for scheduleArrival
    scheduleArrival: isWeekdayName ? data.scheduleArrival : (data.scheduleArrival || data.dateReceived)
  };
};

/**
 * Generic webhook submission function 
 */
export const submitToWebhook = async (url: string, data: any) => {
  try {
    // Format the data before sending
    const formattedData = prepareWebhookData(data);

    console.log("Sending formatted data to plant webhook:", formattedData);
    console.log("Using plant webhook URL:", url);
    console.log("Schedule Arrival value being sent:", formattedData.scheduleArrival);

    // TEMPORARILY REMOVED mode: "no-cors" for debugging
    try {
      console.log("🔍 WEBHOOK UTILS - Initiating fetch request to webhook URL:", url);
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // mode: "no-cors" has been temporarily removed for debugging
        body: JSON.stringify(formattedData),
      });
      
      // Log detailed response information
      console.log(`🔍 WEBHOOK UTILS - Response received from webhook: ${url}`);
      console.log("🔍 WEBHOOK UTILS - HTTP Status:", response.status);
      console.log("🔍 WEBHOOK UTILS - Status Text:", response.statusText);
      
      // Log response headers
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      console.log("🔍 WEBHOOK UTILS - Response Headers:", headers);
      
      // Attempt to parse and log the response body
      try {
        const responseText = await response.text();
        console.log("🔍 WEBHOOK UTILS - Response Body Text:", responseText);
        
        try {
          // Try to parse as JSON if possible
          const responseJson = JSON.parse(responseText);
          console.log("🔍 WEBHOOK UTILS - Response Body JSON:", responseJson);
        } catch (jsonError) {
          console.log("🔍 WEBHOOK UTILS - Response is not JSON format");
        }
      } catch (textError) {
        console.error("❌ WEBHOOK UTILS - Error reading response body:", textError);
      }
      
      // Check if response was successful
      if (response.ok) {
        console.log(`🔍 WEBHOOK UTILS - Successfully triggered webhook: ${url}`);
        return true;
      } else {
        console.error(`❌ WEBHOOK UTILS - Error from webhook ${url}: ${response.status} ${response.statusText}`);
        return false;
      }
      
    } catch (fetchError) {
      console.error(`❌ WEBHOOK UTILS - Fetch error triggering webhook ${url}:`, fetchError);
      return false;
    }
  } catch (error) {
    console.error(`❌ WEBHOOK UTILS - Error triggering webhook ${url}:`, error);
    return false;
  }
};
