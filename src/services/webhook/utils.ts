
/**
 * Utility functions for webhook submissions
 */

import { formatDateForSheets } from "@/utils/dateTime";

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
  
  // Format timestamp for Google Sheets in MM/DD/YYYY hh:mm AM/PM format
  const formattedTimestamp = formatDateForSheets(new Date());

  // Ensure cross dock destination has full store name
  let crossDockDestination = data.crossDockDestination || data.cross_dock_destination || '';
  if (crossDockDestination && !crossDockDestination.includes(' ')) {
    // If it's just a number, it's missing the store name - this is a fallback
    // Ideally, this should be properly formatted before reaching this point
    console.warn("Cross dock destination is missing store name:", crossDockDestination);
    crossDockDestination = `Store ${crossDockDestination}`;
  }
  
  // Map fields to the correct database column names
  const mappedData = {
    ...data,
    // Frontend format (for Google Sheets/Zapier)
    crossDock: data.crossDock || "No",
    crossDockDestination: crossDockDestination,
    receiverNo: data.receiverNo,
    etaDate: data.etaDate,
    
    // Database format (for Supabase)
    cross_dock: data.cross_dock || data.crossDock || "No",
    cross_dock_type: data.cross_dock_type || data.crossDock || "No",
    cross_dock_destination: crossDockDestination,
    cross_dock_receiver_number: data.cross_dock_receiver_number || data.receiverNo,
    cross_dock_eta_date: data.cross_dock_eta_date || data.etaDate,
    
    // Google Sheets webhook format (snake_case as expected by the GS script)
    cross_dock_dest: crossDockDestination,
    
    // Only format dateReceived, leave scheduleArrival as is if it's a weekday name
    dateReceived: data.dateReceived ? formatDate(data.dateReceived) : formatDate(new Date().toISOString()),
    timestamp: formattedTimestamp, // Use formatted timestamp for both Supabase and Sheets
    orderId: data.id || crypto.randomUUID(), // Use existing ID or create a new one
    triggered_from: window.location.origin,
    
    // Ensure manager's email is included with the consistent property names
    managersEmail: data.managerEmail || data.managersEmail || data.email,
    managerEmail: data.managerEmail || data.managersEmail || data.email,
    email: data.managerEmail || data.managersEmail || data.email,
    
    // Ensure destination manager email is included
    destination_manager_email: data.destinationManagerEmail || data.destination_manager_email || '',
    
    // Join multiple casing grades into a comma-separated string if it's an array
    casingGrade: Array.isArray(data.casingGrade) ? data.casingGrade.join(', ') : data.casingGrade,
    
    // Preserve weekday names for scheduleArrival
    scheduleArrival: isWeekdayName ? data.scheduleArrival : (data.scheduleArrival || data.dateReceived),
    
    // Add timestamp to avoid caching
    _nocache: Date.now()
  };

  return mappedData;
};

/**
 * Generic webhook submission function 
 */
export const submitToWebhook = async (url: string, data: any) => {
  // Guard for E2E mode - stub external webhook calls
  const { IS_E2E } = await import('@/config/e2e');
  if (IS_E2E) {
    console.warn('[E2E] Stubbed webhook call to:', url);
    return { ok: true, stubbed: true };
  }
  
  try {
    if (!url || url.trim() === "") {
      console.error("❌ WEBHOOK - Empty webhook URL provided");
      return false;
    }
    
    // Format the data before sending
    const formattedData = prepareWebhookData(data);

    console.log("🔍 WEBHOOK - Sending formatted data to webhook:", formattedData);
    console.log("🔍 WEBHOOK - Using webhook URL:", url);
    console.log("🔍 WEBHOOK - Schedule Arrival value being sent:", formattedData.scheduleArrival);
    console.log("🔍 WEBHOOK - Cross Dock Destination value being sent:", formattedData.cross_dock_dest);
    console.log("🔍 WEBHOOK - Destination Manager Email being sent:", formattedData.destination_manager_email);
    console.log("🔍 WEBHOOK - Timestamp format being sent:", formattedData.timestamp);

    // Add a random query parameter to ensure the request is not cached
    const cacheBuster = Math.random().toString(36).substring(2);
    const urlWithNoCacheParam = `${url}${url.includes('?') ? '&' : '?'}nocache=${Date.now()}&cachebuster=${cacheBuster}`;
    console.log("🔍 WEBHOOK - Using URL with cache-busting:", urlWithNoCacheParam);

    const response = await fetch(urlWithNoCacheParam, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      },
      mode: "no-cors", // Keep no-cors mode for CORS handling
      body: JSON.stringify(formattedData),
    });

    // With no-cors, we won't get a meaningful status, but the request will go through
    console.log(`🔍 WEBHOOK - Successfully triggered webhook: ${url}`);
    return true;
  } catch (error) {
    console.error(`❌ WEBHOOK - Error triggering webhook ${url}:`, error);
    return false;
  }
};
