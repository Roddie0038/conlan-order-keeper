
import { useEffect } from 'react';
import { FormData } from '@/components/order-form/formConfig';

export const useAutoDraft = (formData: FormData, setFormData: (data: FormData) => void) => {
  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('orderDraft');
    if (savedDraft) {
      const parsedDraft = JSON.parse(savedDraft);
      setFormData({
        ...parsedDraft,
        dateReceived: formData.dateReceived // Keep the current timestamp
      });
      console.log('Loaded draft order:', parsedDraft);
    }
  }, []);

  // Save draft whenever form data changes
  useEffect(() => {
    if (Object.values(formData).some(value => value !== "")) {
      localStorage.setItem('orderDraft', JSON.stringify(formData));
      console.log('Saved draft order:', formData);
    }
  }, [formData]);

  const clearDraft = () => {
    localStorage.removeItem('orderDraft');
    console.log('Cleared draft order');
  };

  return { clearDraft };
};
