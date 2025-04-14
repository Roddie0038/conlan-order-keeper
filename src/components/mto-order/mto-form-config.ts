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
  name: string;
  store: string;
  productNumber: string;
  casingGrade: string[];
  tireSize: string;
  customTireSize?: string;
  tireTreadNeeded: string;
  quantity: string;
  scheduleArrival: string;
  notes: string;
  managerEmail: string;
  timestamp?: string;
}

export const initialMTOFormData: MTOFormData = {
  name: "",
  store: "",
  productNumber: "",
  casingGrade: [],
  tireSize: "",
  customTireSize: "",
  tireTreadNeeded: "",
  quantity: "",
  scheduleArrival: "",
  notes: "",
  managerEmail: "",
};
