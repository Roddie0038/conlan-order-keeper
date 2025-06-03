
export const getBadgeColor = (orderType: string) => {
  switch(orderType) {
    case "Transfer": return "bg-blue-500 hover:bg-blue-600";
    case "MTO": return "bg-purple-500 hover:bg-purple-600";
    case "Wheel": return "bg-green-500 hover:bg-green-600";
    case "Warranty": return "bg-orange-500 hover:bg-orange-600";
    default: return "bg-gray-500 hover:bg-gray-600";
  }
};
