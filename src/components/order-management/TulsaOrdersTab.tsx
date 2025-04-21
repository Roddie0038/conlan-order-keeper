
import { FilteredOrdersList } from "@/components/orders/FilteredOrdersList";

interface TulsaOrdersTabProps {
  targetDate: string;
  targetStore: string;
  className?: string;
}

export function TulsaOrdersTab({ targetDate, targetStore, className }: TulsaOrdersTabProps) {
  return (
    <FilteredOrdersList
      targetDate={targetDate}
      targetStore={targetStore}
      className={className}
    />
  );
}
