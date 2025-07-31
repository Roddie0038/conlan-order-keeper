/**
 * Phase 4: Order Form Base Component
 * Reusable base form component for all order types
 */

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormRestorationBanner } from '@/components/ui/form-restoration-banner';
import { ClearFormButton } from '@/components/ui/clear-form-button';
import { OrderTemplate } from '@/components/order-templates/OrderTemplate';

export interface OrderFormBaseProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting?: boolean;
  submitText?: string;
  templateType: 'regular' | 'mto' | 'wheel';
  currentData?: any;
  onLoadTemplate?: (data: any) => void;
  onClearForm?: () => void;
  showPersistence?: boolean;
  lastSaved?: Date | null;
  isRestoring?: boolean;
  className?: string;
}

export function OrderFormBase({
  title,
  icon,
  children,
  onSubmit,
  isSubmitting = false,
  submitText = 'Submit Order',
  templateType,
  currentData,
  onLoadTemplate,
  onClearForm,
  showPersistence = false,
  lastSaved,
  isRestoring = false,
  className = '',
}: OrderFormBaseProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {showPersistence && (
        <FormRestorationBanner isRestoring={isRestoring} lastSaved={lastSaved} />
      )}
      
      {/* Template Section */}
      {onLoadTemplate && (
        <Card className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 p-6">
            <div className="flex items-center">
              {icon && <div className="mr-4">{icon}</div>}
              <h2 className="text-2xl font-semibold text-white">Order Templates</h2>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <OrderTemplate 
                  type={templateType}
                  currentData={currentData}
                  onLoadTemplate={onLoadTemplate}
                />
              </div>
              {onClearForm && showPersistence && (
                <div className="ml-4">
                  <ClearFormButton 
                    onClear={onClearForm}
                    lastSaved={lastSaved}
                    disabled={isRestoring}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Form */}
      <Card className="bg-white shadow-xl transition-all duration-300 hover:shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 p-6">
          <div className="flex items-center">
            {icon && <div className="mr-4">{icon}</div>}
            <h1 className="text-2xl font-semibold text-white">{title}</h1>
          </div>
        </CardHeader>
        
        <form onSubmit={onSubmit}>
          <CardContent className="p-8">
            {children}
          </CardContent>
          
          <div className="px-6 pb-6">
            <Button 
              type="submit" 
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-md transition-all duration-200 hover:shadow-md hover:scale-[1.01] flex items-center justify-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : submitText}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}