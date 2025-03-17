export const stores = [
  { id: "22", name: "Fort Worth 22" },
  { id: "27", name: "Grand Prairie 27" },
  { id: "28", name: "Houston 28" },
  { id: "29", name: "San Antonio 29" },
  { id: "30", name: "OKC 30" },
  { id: "32", name: "Little Rock 32" },
  { id: "33", name: "Kansas 33" },
  { id: "35", name: "Laredo 35" },
  { id: "36", name: "Tulsa 36" },
  { id: "39", name: "Austin 39" },
];

export const storeManagerEmails: Record<string, string> = {
  "Admin": "orders@conlantire.com",
  "22": "fwtorders@conlantire.com",
  "27": "gporders@conlantire.com",
  "28": "htxorders@conlantire.com", 
  "29": "satxorders@conlantire.com",
  "30": "okorders@conlantire.com",
  "32": "lrorders@conlantire.com",
  "33": "kcorders@conlantire.com",
  "35": "lrdorders@conlantire.com",
  "36": "tlsorders@conlantire.com",
  "39": "atxorders@conlantire.com",
  "99": "bperry@conlantire.com, rjennings@conlantire.com, drsanchez@conlantire.com"
};

export const scheduleOptions = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Will Call Pick Up",
].map(value => ({ value }));

export const crossDockOptions = [
  { value: "yes", name: "Yes" },
  { value: "no", name: "No" },
];

export type FormData = {
  yourName: string;
  store: string;
  dateReceived: string;
  productNumber: string;
  description: string;
  quantity: string;
  scheduleArrival: string;
  notes: string;
  crossDock: string;
  crossDockDestination?: string;
  managersEmail?: string;
};

export const initialFormData: FormData = {
  yourName: "",
  store: "",
  dateReceived: "",
  productNumber: "",
  description: "",
  quantity: "",
  scheduleArrival: "",
  notes: "",
  crossDock: "",
  crossDockDestination: "",
  managersEmail: "",
};
