import React from 'react';
import { TransferRouteSelector } from './TransferRouteSelector';
import { CarrierSelector } from './CarrierSelector';
import { ArrivalDateSelector } from './ArrivalDateSelector';
import { type TransferRoute, type Carrier } from '@/types/orders';

interface TransferFieldsSectionProps {
  transferRoute?: TransferRoute;
  carrier?: Carrier;
  arrivalDate?: string;
  onTransferRouteChange: (value: TransferRoute) => void;
  onCarrierChange: (value: Carrier) => void;
  onArrivalDateChange: (value: string) => void;
  className?: string;
}

export function TransferFieldsSection({
  transferRoute,
  carrier,
  arrivalDate,
  onTransferRouteChange,
  onCarrierChange,
  onArrivalDateChange,
  className = '',
}: TransferFieldsSectionProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="border-l-4 border-purple-500 pl-3 py-1">
        <h3 className="text-lg font-medium text-gray-900">Transfer & Shipping Details</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-5">
        <TransferRouteSelector
          value={transferRoute}
          onChange={onTransferRouteChange}
        />
        
        <CarrierSelector
          value={carrier}
          onChange={onCarrierChange}
        />
        
        <ArrivalDateSelector
          value={arrivalDate}
          onChange={onArrivalDateChange}
        />
      </div>
    </div>
  );
}