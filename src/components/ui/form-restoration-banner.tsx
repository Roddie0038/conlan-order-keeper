import React from 'react';

interface FormRestorationBannerProps {
  isRestoring: boolean;
  lastSaved?: Date | null;
  onClearData?: () => void;
  saveCount?: number;
}

export function FormRestorationBanner(_props: FormRestorationBannerProps) {
  return null;
}

export default FormRestorationBanner;