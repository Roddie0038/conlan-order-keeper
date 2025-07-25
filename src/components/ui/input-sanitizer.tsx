// SECURITY FIX: Input sanitization component to prevent XSS attacks

import React, { useState, useEffect } from 'react';
import { Input } from './input';
import { Textarea } from './textarea';
import { sanitizeTextInput, validateEmail } from '@/utils/inputValidation';

interface SanitizedInputProps {
  type?: 'text' | 'email' | 'tel' | 'url';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  maxLength?: number;
  required?: boolean;
  disabled?: boolean;
}

export function SanitizedInput({
  type = 'text',
  value,
  onChange,
  placeholder,
  className,
  maxLength = 1000,
  required = false,
  disabled = false
}: SanitizedInputProps) {
  const [error, setError] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    
    // Sanitize input
    const sanitizedValue = sanitizeTextInput(rawValue);
    
    // Validate based on type
    let isValid = true;
    let errorMessage = '';
    
    if (type === 'email' && sanitizedValue && !validateEmail(sanitizedValue)) {
      isValid = false;
      errorMessage = 'Please enter a valid email address';
    }
    
    // Check length
    if (sanitizedValue.length > maxLength) {
      isValid = false;
      errorMessage = `Input must be less than ${maxLength} characters`;
    }
    
    setError(errorMessage);
    onChange(sanitizedValue);
  };

  return (
    <div className="space-y-1">
      <Input
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={`${className} ${error ? 'border-destructive' : ''}`}
        maxLength={maxLength}
        required={required}
        disabled={disabled}
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}

interface SanitizedTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  maxLength?: number;
  rows?: number;
  required?: boolean;
  disabled?: boolean;
}

export function SanitizedTextarea({
  value,
  onChange,
  placeholder,
  className,
  maxLength = 5000,
  rows = 3,
  required = false,
  disabled = false
}: SanitizedTextareaProps) {
  const [error, setError] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const rawValue = e.target.value;
    
    // Sanitize input
    const sanitizedValue = sanitizeTextInput(rawValue);
    
    // Check length
    let errorMessage = '';
    if (sanitizedValue.length > maxLength) {
      errorMessage = `Input must be less than ${maxLength} characters`;
    }
    
    setError(errorMessage);
    onChange(sanitizedValue);
  };

  return (
    <div className="space-y-1">
      <Textarea
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={`${className} ${error ? 'border-destructive' : ''}`}
        maxLength={maxLength}
        rows={rows}
        required={required}
        disabled={disabled}
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      <p className="text-xs text-muted-foreground">
        {value.length}/{maxLength} characters
      </p>
    </div>
  );
}