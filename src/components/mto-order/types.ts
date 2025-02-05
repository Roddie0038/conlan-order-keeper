export interface MTOFormData {
  store: string;
  timestamp: string;
  name: string;
  productNumber: string;
  casingGrade: string;
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
  productNumber: "",
  casingGrade: "",
  tireSize: "",
  customTireSize: "",
  tireTreadNeeded: "",
  quantity: "",
  scheduleArrival: "",
  notes: "",
};