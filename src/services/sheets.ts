interface OrderData {
  timestamp: string;
  yourName: string;
  store: string;
  dateReceived: string;
  productNumber: string;
  description: string;
  quantity: string;
  scheduleArrival: string;
  notes: string;
  crossDock: string;
}

export const submitToGoogleSheets = async (data: OrderData) => {
  console.log("Submitting order to Google Sheets:", data);
  
  try {
    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbzufv7QnjIXPRvBHJkxLq3tmJ3wD6M9DboOCmQIVe0wABhGuBBLdRCkBeOZ6CQ-Orms/exec",
      {
        method: "POST",
        body: JSON.stringify({
          yourName: data.yourName,
          store: data.store,
          dateReceived: data.dateReceived,
          productNumber: data.productNumber,
          description: data.description,
          quantity: data.quantity,
          scheduleArrival: data.scheduleArrival,
          notes: data.notes,
          crossDock: data.crossDock
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to submit order");
    }

    const result = await response.json();
    console.log("Google Sheets response:", result);
    return result;
  } catch (error) {
    console.error("Error submitting to Google Sheets:", error);
    throw error;
  }
};