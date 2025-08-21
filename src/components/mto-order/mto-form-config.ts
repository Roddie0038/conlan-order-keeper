
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
  destinationPlant: string;
  // Cross-plant ordering fields (Phase 2)
  ordering_store?: string;
  ordering_plant?: string;
  destination_plant?: string;
}

export const stores = [
  "Fort Worth 022", "Grand Prairie 027", "Houston 028", "San Antonio 029", "Oklahoma City 030", "Little Rock 032", 
  "Kansas City 033", "Laredo 035", "Tulsa 036", "Austin 039"
];

export const casingGrades = [
  { name: "Casing A", value: "casingA" },
  { name: "Casing B", value: "casingB" },
  { name: "Casing C", value: "casingC" },
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
