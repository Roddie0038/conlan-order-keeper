/**
 * Phase 4: Modernized MTO Form Hook
 * Delegates all business logic to MTOOrderService
 */

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { MTOOrderService } from "@/services/orderService/MTOOrderService";
import { MTOFormData } from "../mto-form-config";
import { logger } from '@/utils/logger';

export const useMTOFormV2 = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data using service
  const [formData, setFormData] = useState<MTOFormData>(
    () => MTOOrderService.createDefaultFormData(user?.store)
  );

  const handleChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const resetForm = () => {
    const defaultData = MTOOrderService.resetFormData(user?.store);
    setFormData(defaultData);
    setErrors({});
    
    logger.info('MTO form reset', {
      service: 'useMTOFormV2',
      userStore: user?.store
    });
  };

  const submitOrder = async () => {
    setIsSubmitting(true);
    setErrors({});

    try {
      logger.info('MTO order submission started', {
        service: 'useMTOFormV2',
        store: formData.store
      });

      // Delegate to service layer
      const result = await MTOOrderService.submitOrder(formData);

      if (result.success) {
        toast({
          title: "MTO Order Submitted",
          description: "Your MTO order has been submitted successfully.",
        });

        resetForm();
      } else {
        // Handle validation errors from service
        if (result.error === 'Validation failed') {
          const validationErrors = MTOOrderService.validateMTOForm(formData);
          setErrors(validationErrors);
          
          toast({
            title: "Validation Error",
            description: "Please correct the highlighted fields.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Submission Error",
            description: result.error || "Failed to submit MTO order. Please try again.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error('MTO submission error in hook', {
        service: 'useMTOFormV2',
        error: errorMessage
      });

      toast({
        title: "Submission Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getManagerEmail = async () => {
    if (formData.store) {
      try {
        return await MTOOrderService.getManagerEmail(formData.store);
      } catch (error) {
        logger.error("Error getting manager email", {
          service: 'useMTOFormV2',
          store: formData.store,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        return "";
      }
    }
    return "";
  };

  return {
    formData,
    setFormData,
    isSubmitting,
    errors,
    handleChange,
    resetForm,
    submitOrder,
    getManagerEmail,
    toast,
    isAdmin: user?.isAdmin || false,
  };
};