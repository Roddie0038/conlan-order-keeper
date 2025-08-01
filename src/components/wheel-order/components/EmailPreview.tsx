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
  
  console.log("🔍 WHEEL EMAIL PREVIEW DEBUG:", {
    storeName: formData.storeName,
    destinationPlant: formData.destinationPlant,
    selectedPlant,
    managerEmail,
    storeId: formData.storeId,
    userStore: formData.userStore
  });
  
  // Don't render if no store is set
  if (!formData.storeName) {
    console.log("🚨 WHEEL EMAIL PREVIEW - No storeName, not rendering");
    return null;
  }

  // Use fallback plant from context if destination plant not set
  const plantToUse = formData.destinationPlant || selectedPlant;
  
  console.log("🔍 WHEEL EMAIL PREVIEW - Plant selection:", {
    destinationPlant: formData.destinationPlant,
    selectedPlant,
    plantToUse
  });
  
  if (!plantToUse) {
    console.log("🚨 WHEEL EMAIL PREVIEW - No plant available, not rendering");
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