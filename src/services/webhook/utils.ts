
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
 * Generic webhook submission function with enhanced response handling
 */
export const submitToWebhook = async (url: string, data: any) => {
  try {
    // Format the data before sending
    const formattedData = prepareWebhookData(data);

    console.log("📤 WEBHOOK - Sending formatted data to webhook:", JSON.stringify(formattedData, null, 2));
    console.log("📤 WEBHOOK - Using webhook URL:", url);
    
    // Try with CORS first to get proper response
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });
      
      console.log(`📥 WEBHOOK - Response status:`, response.status);
      
      if (response.ok) {
        console.log(`✅ WEBHOOK - Successfully triggered webhook with proper CORS`);
        
        try {
          const responseText = await response.text();
          console.log(`📥 WEBHOOK - Response body:`, responseText);
        } catch (e) {
          console.log(`📥 WEBHOOK - Could not read response body:`, e);
        }
        
        return true;
      } else {
        console.warn(`⚠️ WEBHOOK - Response not OK, falling back to no-cors mode. Status: ${response.status}`);
        throw new Error("Response not OK");
      }
    } catch (corsError) {
      // If CORS fails, fall back to no-cors mode
      console.log(`⚠️ WEBHOOK - CORS request failed, trying no-cors mode:`, corsError);
      
      const noCorsResponse = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors", // Fall back to no-cors mode
        body: JSON.stringify(formattedData),
      });
      
      console.log(`📥 WEBHOOK - no-cors mode used, cannot read response status. Assuming success.`);
      return true;
    }
  } catch (error) {
    console.error(`❌ WEBHOOK - Error triggering webhook ${url}:`, error);
    return false;
  }
};

/**
 * Function to test webhook connectivity
 */
export const testWebhook = async (url: string) => {
  try {
    console.log(`🧪 WEBHOOK TEST - Testing webhook URL: ${url}`);
    
    const testData = {
      test: true,
      timestamp: new Date().toISOString(),
      message: "This is a test request from the Lovable webhook system"
    };
    
    // Try with regular CORS first
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
      });
      
      console.log(`🧪 WEBHOOK TEST - Response status:`, response.status);
      
      if (response.ok) {
        console.log(`✅ WEBHOOK TEST - Successfully tested webhook with proper CORS`);
        
        try {
          const responseText = await response.text();
          console.log(`🧪 WEBHOOK TEST - Response body:`, responseText);
          return {
            success: true,
            status: response.status,
            response: responseText
          };
        } catch (e) {
          console.log(`🧪 WEBHOOK TEST - Could not read response body:`, e);
          return {
            success: true,
            status: response.status,
            response: "Unable to read response body"
          };
        }
      } else {
        console.warn(`⚠️ WEBHOOK TEST - Response not OK. Status: ${response.status}`);
        return {
          success: false,
          status: response.status,
          error: "Response not OK"
        };
      }
    } catch (corsError) {
      // If CORS fails, fall back to no-cors mode
      console.log(`⚠️ WEBHOOK TEST - CORS request failed, trying no-cors mode:`, corsError);
      
      const noCorsResponse = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors", // Fall back to no-cors mode
        body: JSON.stringify(testData),
      });
      
      console.log(`🧪 WEBHOOK TEST - no-cors mode used, cannot read response status.`);
      return {
        success: true,
        status: "unknown (no-cors mode)",
        response: "Used no-cors mode, response details unavailable"
      };
    }
  } catch (error) {
    console.error(`❌ WEBHOOK TEST - Error testing webhook ${url}:`, error);
    return {
      success: false,
      error: String(error)
    };
  }
};
