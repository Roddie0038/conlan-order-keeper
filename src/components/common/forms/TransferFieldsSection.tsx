import React from 'react';
import { TransferRouteSelector } from './TransferRouteSelector';
import { CarrierSelector } from './CarrierSelector';

import { type TransferRoute, type Carrier } from '@/types/orders';

interface TransferFieldsSectionProps {
  transferRoute?: TransferRoute;
  carrier?: Carrier;
  onTransferRouteChange: (value: TransferRoute) => void;
  onCarrierChange: (value: Carrier) => void;
  className?: string;
}

export function TransferFieldsSection({
  transferRoute,
  carrier,
  onTransferRouteChange,
  onCarrierChange,
  className = '',
}: TransferFieldsSectionProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="border-l-4 border-purple-500 pl-3 py-1">
        <h3 className="text-lg font-medium text-gray-900">Transfer & Shipping Details</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-5">
        <TransferRouteSelector
          value={transferRoute}
          onChange={onTransferRouteChange}
        />
        
        <CarrierSelector
          value={carrier}
          onChange={onCarrierChange}
        />
      </div>
    </div>
  );
}