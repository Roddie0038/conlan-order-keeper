
import { CombinedOrder } from "../types";

export const sortOrders = (
  orders: CombinedOrder[],
  sortField: string,
  sortDirection: 'asc' | 'desc'
) => {
  return [...orders].sort((a, b) => {
    let valueA = a[sortField as keyof CombinedOrder];
    let valueB = b[sortField as keyof CombinedOrder];
    
    if (valueA === undefined || valueA === null) valueA = '';
    if (valueB === undefined || valueB === null) valueB = '';
    
    const strA = String(valueA).toLowerCase();
    const strB = String(valueB).toLowerCase();
    
    if (sortField === 'timestamp') {
      try {
        const dateA = new Date(strA);
        const dateB = new Date(strB);
        
        if (sortDirection === 'asc') {
          return dateA.getTime() - dateB.getTime();
        } else {
          return dateB.getTime() - dateA.getTime();
        }
      } catch (e) {
        // Fall back to string comparison
      }
    }
    
    if (sortDirection === 'asc') {
      return strA.localeCompare(strB);
    } else {
      return strB.localeCompare(strA);
    }
  });
};
