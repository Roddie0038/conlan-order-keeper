/**
 * Wheel Order Email Preview Component
 * Shows email recipients for wheel orders specifically
 */

import React from 'react';
import { EmailRecipientsPreview } from '@/components/shared/EmailRecipientsPreview';
import type { WheelFormData } from '../types';

interface WheelEmailPreviewProps {
  formData: WheelFormData;
  managerEmail: string;
  className?: string;
}

export const WheelEmailPreview: React.FC<WheelEmailPreviewProps> = ({
  formData,
  managerEmail,
  className = ""
}) => {
  if (!formData.storeName || !formData.destinationPlant) {
    return null;
  }

  return (
    <EmailRecipientsPreview
      store={formData.storeName}
      plant={formData.destinationPlant}
      emailType="wheel"
      orderData={{
        manager_email: managerEmail,
        email: managerEmail
      }}
      className={className}
    />
  );
};