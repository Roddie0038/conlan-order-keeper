/**
 * Phase 4: Reusable Form Section Component
 * Standardized section wrapper for all forms
 */

import React from 'react';
import { CheckCircle } from 'lucide-react';

export interface FormSectionProps {
  title: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'orange' | 'red' | 'purple';
  children: React.ReactNode;
  className?: string;
}

const colorClasses = {
  blue: 'border-blue-500 text-blue-500',
  green: 'border-green-500 text-green-500',
  yellow: 'border-yellow-500 text-yellow-500',
  orange: 'border-orange-500 text-orange-500',
  red: 'border-red-500 text-red-500',
  purple: 'border-purple-500 text-purple-500',
};

export function FormSection({
  title,
  icon = <CheckCircle className="h-5 w-5" />,
  color = 'blue',
  children,
  className = '',
}: FormSectionProps) {
  const colorClass = colorClasses[color];

  return (
    <div className={`space-y-6 ${className}`}>
      <div className={`flex items-center space-x-2 border-l-4 ${colorClass} pl-3 py-1`}>
        <div className={colorClass}>
          {icon}
        </div>
        <h3 className="text-lg font-medium text-black">{title}</h3>
      </div>
      
      <div className="pl-5">
        {children}
      </div>
    </div>
  );
}