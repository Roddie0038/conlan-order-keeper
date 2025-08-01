/**
 * Wheel Order Email Preview Component
 * Shows email recipients for wheel orders specifically
 */

import React from 'react';
import { EmailRecipientsPreview } from '@/components/shared/EmailRecipientsPreview';
import { usePlant } from '@/contexts/PlantContext';
import type { WheelFormData } from '../types';

interface WheelEmailPreviewProps {
  formData: WheelFormData;
  managerEmail: string;
  className?: string;
  onRecipientsChange?: (count: number) => void;
}

export const WheelEmailPreview: React.FC<WheelEmailPreviewProps> = ({
  formData,
  managerEmail,
  className = "",
  onRecipientsChange
}) => {
  const { selectedPlant } = usePlant();
  
  // Don't render if no store is set
  if (!formData.storeName) {
    return null;
  }

  // Use fallback plant from context if destination plant not set
  const plantToUse = formData.destinationPlant || selectedPlant;
  
  if (!plantToUse) {
    return null;
  }

  return (
    <EmailRecipientsPreview
      store={formData.storeName}
      plant={plantToUse}
      emailType="wheel"
      orderData={{
        manager_email: managerEmail,
        email: managerEmail
      }}
      className={className}
      onRecipientsChange={onRecipientsChange}
    />
  );
};