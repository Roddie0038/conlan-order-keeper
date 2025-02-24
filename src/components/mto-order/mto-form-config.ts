
export const casingGrades = [
  { value: "A Casing", name: "A Casing" },
  { value: "B Casing", name: "B Casing" },
  { value: "C Casing", name: "C Casing" },
];

export const tireSizes = [
  { value: "295/75R22.5", name: "295/75R22.5" },
  { value: "11R22.5", name: "11R22.5" },
  { value: "11R24.5", name: "11R24.5" },
  { value: "custom", name: "Other (Type Below)" },
];

export const scheduleOptions = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Will Call Pick Up",
].map(value => ({ value }));

export interface MTOFormData {
  store: string;
  timestamp: string;
  name: string;
  managerEmail: string;
  productNumber: string;
  casingGrade: string[];  // Changed to string array for multiple selections
  tireSize: string;
  customTireSize: string;
  tireTreadNeeded: string;
  quantity: string;
  scheduleArrival: string;
  notes: string;
}

export const initialMTOFormData: MTOFormData = {
  store: "",
  timestamp: new Date().toLocaleString(),
  name: "",
  managerEmail: "",
  productNumber: "",
  casingGrade: [],  // Initialize as empty array
  tireSize: "",
  customTireSize: "",
  tireTreadNeeded: "",
  quantity: "",
  scheduleArrival: "",
  notes: "",
};
