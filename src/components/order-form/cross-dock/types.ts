
export interface ProductRow {
  productCode: string;
  description: string;
  quantity: string;
}

export interface CrossDockPaperworkData {
  date: string;
  fromStore: string;
  toStore: string;
  receiverNo: string;
  products: ProductRow[];
}

export const initialFormData: CrossDockPaperworkData = {
  date: new Date().toISOString().split('T')[0],
  fromStore: "",
  toStore: "",
  receiverNo: "",
  products: [{ productCode: "", description: "", quantity: "" }],
};
