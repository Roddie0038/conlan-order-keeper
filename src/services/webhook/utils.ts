
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

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "no-cors", // Keep no-cors mode for CORS handling
      body: JSON.stringify(formattedData),
    });

    // With no-cors, we won't get a meaningful status, but the request will go through
    console.log(`Successfully triggered plant webhook: ${url}`);
    return true;
  } catch (error) {
    console.error(`Error triggering plant webhook ${url}:`, error);
    return false;
  }
};
