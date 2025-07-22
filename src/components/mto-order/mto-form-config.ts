
export type MTOFormSection = "store" | "product" | "order" | "all" | "plant";

export interface MTOFormData {
  store: string;
  name: string;
  timestamp: string;
  productNumber: string;
  casingGrade: string[];
  tireSize: string;
  customTireSize: string;
  tireTreadNeeded: string;
  quantity: string;
  notes: string;
  managerEmail: string;
  destinationPlant: string; // ✅ Added mandatory plant field
}

export const stores = [
  "Store 22", "Store 27", "Store 28", "Store 29", "Store 30", "Store 32", 
  "Store 33", "Store 35", "Store 36", "Store 39"
];

export const casingGrades = [
  { name: "Grade 1", value: "grade1" },
  { name: "Grade 2", value: "grade2" },
  { name: "Grade 3", value: "grade3" },
  { name: "Grade 4", value: "grade4" },
  { name: "Grade 5", value: "grade5" },
];

export const tireSizes = [
  { value: "11R22.5", label: "11R22.5" },
  { value: "11R24.5", label: "11R24.5" },
  { value: "295/75R22.5", label: "295/75R22.5" },
  { value: "285/75R24.5", label: "285/75R24.5" },
  { value: "custom", label: "Custom Size" },
];

export const scheduleOptions = [
  "ASAP",
  "Next Week",
  "2 Weeks",
  "1 Month",
  "Custom Date"
];
