/**
 * Phase 4: Form Field Wrapper Component
 * Standardized field wrapper with error handling
 */

import React from 'react';
import { Label } from '@/components/ui/label';

export interface FormFieldWrapperProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
  description?: string;
}

export function FormFieldWrapper({
  label,
  required = false,
  error,
  children,
  className = '',
  description,
}: FormFieldWrapperProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
      
      {children}
      
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}