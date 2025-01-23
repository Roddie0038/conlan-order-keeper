interface OrderData {
  timestamp: string;
  name: string;
  store: string;
  date: string;
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
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to submit order");
    }

    return await response.json();
  } catch (error) {
    console.error("Error submitting to Google Sheets:", error);
    throw error;
  }
};