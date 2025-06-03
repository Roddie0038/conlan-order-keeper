
export interface CombinedOrder {
  id: string;
  timestamp: string;
  name: string;
  store: string;
  productNumber: string;
  description: string;
  quantity: number;
  scheduleArrival: string;
  notes: string;
  status: string;
  completed: boolean;
  orderType: 'Transfer' | 'MTO' | 'Wheel' | 'Warranty';
  completedAt?: string;
  completedBy?: string;
}
