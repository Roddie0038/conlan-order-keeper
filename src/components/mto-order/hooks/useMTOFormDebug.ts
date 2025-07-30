// Debugging hook specifically for MTO form submissions
import { useEffect } from 'react';

export const useMTOFormDebug = (formData: any, submitAction: any) => {
  useEffect(() => {
    console.log("🔍 MTO DEBUG - Form data changed:", {
      keys: Object.keys(formData || {}),
      hasOrderId: 'order_id' in (formData || {}),
      hasId: 'id' in (formData || {}),
      suspiciousKeys: Object.keys(formData || {}).filter(key => 
        key.toLowerCase().includes('id') || 
        key.toLowerCase().includes('order')
      ),
      formData
    });
  }, [formData]);

  useEffect(() => {
    // Monitor for any hidden data injection
    if (window.addEventListener) {
      const handleBeforeUnload = () => {
        console.log("🔍 MTO DEBUG - Page unload, final form state:", formData);
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [formData]);

  // Debug wrapper for submit actions
  const debuggedSubmitAction = async (...args: any[]) => {
    console.log("🔍 MTO DEBUG - Submit action called with args:", args);
    
    // Check for any hidden form data
    const formElement = document.querySelector('form');
    if (formElement) {
      const formDataObj = new FormData(formElement);
      const hiddenFields: string[] = [];
      for (const [key, value] of formDataObj.entries()) {
        if (key.toLowerCase().includes('id') || key.toLowerCase().includes('order')) {
          hiddenFields.push(`${key}: ${value}`);
        }
      }
      if (hiddenFields.length > 0) {
        console.warn("🚨 MTO DEBUG - Hidden form fields found:", hiddenFields);
      }
    }
    
    try {
      return await submitAction(...args);
    } catch (error) {
      console.error("🔍 MTO DEBUG - Submit action failed:", error);
      throw error;
    }
  };

  return { debuggedSubmitAction };
};