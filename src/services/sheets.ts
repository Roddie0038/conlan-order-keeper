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
  
  // Add spreadsheet configuration to the request
  const requestData = {
    ...data,
    spreadsheetId: "1edSWXDfyP6xNV59tgemckuL3lseWJy73fmsnkd9d7Fk",
    tabs: ["Order Tracking", "Orders", "Master Copy Store Orders"],
    columns: {
      timestamp: "A",
      name: "B",
      store: "C",
      date: "D",
      productNumber: "E",
      description: "F",
      quantity: "G",
      scheduleArrival: "H",
      notes: "I",
      crossDock: "J"
    }
  };
  
  try {
    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbzufv7QnjIXPRvBHJkxLq3tmJ3wD6M9DboOCmQIVe0wABhGuBBLdRCkBeOZ6CQ-Orms/exec",
      {
        method: "POST",
        body: JSON.stringify(requestData),
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