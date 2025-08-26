import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { OrderFormBase } from '@/components/common/forms/OrderFormBase';
import { PlantStoreSelector } from './PlantStoreSelector';
import { OrderTypeSelector } from './OrderTypeSelector';
import { TransportDetailsForm } from './TransportDetailsForm';
import { useToast } from '@/hooks/use-toast';
import { Building2 } from 'lucide-react';

interface RegionalOrderFormData {
  orderingStore: string;
  sourcePlant: string;
  fulfilledByPlant: string;
  isPlantToPlant: boolean;
  orderType: 'transfer' | 'mto';
  carrier?: string;
  requestedPickupTime?: string;
  crossDockRequired?: boolean;
  notes?: string;
}

export function RegionalOrderingForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<RegionalOrderFormData>({
    orderingStore: '',
    sourcePlant: '',
    fulfilledByPlant: '',
    isPlantToPlant: false,
    orderType: 'transfer',
  });

  const handleFormChange = (field: keyof RegionalOrderFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation logic for both modes
    if (formData.isPlantToPlant) {
      if (!formData.sourcePlant || !formData.fulfilledByPlant) {
        toast({
          title: "Validation Error",
          description: "Please select both source plant and fulfilled by plant for plant-to-plant transfers",
          variant: "destructive",
        });
        return;
      }
    } else {
      if (!formData.orderingStore || !formData.fulfilledByPlant) {
        toast({
          title: "Validation Error",
          description: "Please select both ordering store and fulfilled by plant",
          variant: "destructive",
        });
        return;
      }
    }

    setIsSubmitting(true);
    
    try {
      // TODO: Implement regional order creation logic with proper payload
      const orderDescription = formData.isPlantToPlant 
        ? `${formData.sourcePlant} to ${formData.fulfilledByPlant}` 
        : formData.orderingStore;
      
      console.log('Regional order data:', {
        ...formData,
        orderDescription,
        mode: formData.isPlantToPlant ? 'plant-to-plant' : 'store-to-plant'
      });
      
      toast({
        title: "Order Created",
        description: `${formData.orderType.toUpperCase()} order created for ${orderDescription}`,
      });
      
      // Reset form
      setFormData({
        orderingStore: '',
        sourcePlant: '',
        fulfilledByPlant: '',
        isPlantToPlant: false,
        orderType: 'transfer',
      });
      
    } catch (error) {
      console.error('Error creating regional order:', error);
      toast({
        title: "Error",
        description: "Failed to create regional order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OrderFormBase
      title="Create Regional Order"
      icon={<Building2 className="h-6 w-6 text-white" />}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitText="Create Regional Order"
      templateType="regular"
    >
      <div className="space-y-6">
        <PlantStoreSelector
          orderingStore={formData.orderingStore}
          sourcePlant={formData.sourcePlant}
          fulfilledByPlant={formData.fulfilledByPlant}
          isPlantToPlant={formData.isPlantToPlant}
          onOrderingStoreChange={(value) => handleFormChange('orderingStore', value)}
          onSourcePlantChange={(value) => handleFormChange('sourcePlant', value)}
          onFulfilledByPlantChange={(value) => handleFormChange('fulfilledByPlant', value)}
          onModeChange={(isPlantToPlant) => handleFormChange('isPlantToPlant', isPlantToPlant)}
        />

        <OrderTypeSelector
          selectedType={formData.orderType}
          onTypeChange={(value) => handleFormChange('orderType', value)}
        />

        <TransportDetailsForm
          carrier={formData.carrier}
          requestedPickupTime={formData.requestedPickupTime}
          crossDockRequired={formData.crossDockRequired}
          notes={formData.notes}
          onCarrierChange={(value) => handleFormChange('carrier', value)}
          onPickupTimeChange={(value) => handleFormChange('requestedPickupTime', value)}
          onCrossDockChange={(value) => handleFormChange('crossDockRequired', value)}
          onNotesChange={(value) => handleFormChange('notes', value)}
        />
      </div>
    </OrderFormBase>
  );
}