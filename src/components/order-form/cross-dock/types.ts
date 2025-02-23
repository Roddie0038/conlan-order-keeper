
export interface CrossDockPaperworkData {
  date: string;
  fromStore: string;
  toStore: string;
  receiverNo: string;
  productCode: string;
  description: string;
  quantity: string;
}

export const initialFormData: CrossDockPaperworkData = {
  date: new Date().toISOString().split('T')[0],
  fromStore: "",
  toStore: "",
  receiverNo: "",
  productCode: "",
  description: "",
  quantity: "",
};
