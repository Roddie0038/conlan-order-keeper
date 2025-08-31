import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { hasFullStoreAccess } from '@/lib/roles';
import { NeoField } from '@/components/ui/NeoField';
import { Mail, Lock, Unlock } from 'lucide-react';

interface OrderingEmailFieldProps {
  value: string;
  onChange: (email: string) => void;
  label?: string;
  placeholder?: string;
  fallbackEmail?: string;
  className?: string;
  disabled?: boolean;
}

const EMAIL_DOMAIN_REGEX = /@conlantire\.com$/i;
const EMAIL_FORMAT_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function OrderingEmailField({
  value,
  onChange,
  label = 'Ordering Email',
  placeholder = 'e.g. name@conlantire.com',
  fallbackEmail,
  className = '',
  disabled = false
}: OrderingEmailFieldProps) {
  const { user } = useAuth();
  const elevated = hasFullStoreAccess(user);
  const isEditable = elevated && !disabled;
  
  const [localValue, setLocalValue] = React.useState(value);
  const [validationError, setValidationError] = React.useState<string>('');

  // Sync local value when prop changes
  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Default to auth email for elevated users, fallback email for others
  React.useEffect(() => {
    if (!value && !localValue) {
      const defaultEmail = elevated ? (user?.email || fallbackEmail || '') : (fallbackEmail || user?.email || '');
      setLocalValue(defaultEmail);
      onChange(defaultEmail);
    }
  }, [value, localValue, elevated, user?.email, fallbackEmail, onChange]);

  const validateEmail = (email: string): string => {
    const trimmed = email.trim();
    if (!trimmed) {
      return elevated ? 'Email is required' : '';
    }
    if (!EMAIL_FORMAT_REGEX.test(trimmed)) {
      return 'Enter a valid email address';
    }
    if (!EMAIL_DOMAIN_REGEX.test(trimmed)) {
      return 'Use a company email (e.g., name@conlantire.com)';
    }
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    
    if (isEditable) {
      const error = validateEmail(newValue);
      setValidationError(error);
      
      if (!error) {
        onChange(newValue.trim().toLowerCase());
      }
    }
  };

  const handleBlur = () => {
    if (isEditable && !localValue.trim() && elevated) {
      // Fallback to auth email if empty
      const authEmail = user?.email || '';
      setLocalValue(authEmail);
      onChange(authEmail);
      setValidationError('');
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center text-white text-sm font-medium">
        <Mail className="h-4 w-4 mr-1 text-gray-400" />
        {label}
        {isEditable ? (
          <Unlock className="h-3 w-3 ml-1 text-green-600" />
        ) : (
          <Lock className="h-3 w-3 ml-1 text-gray-500" />
        )}
      </div>
      
      <NeoField
        type="email"
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={!isEditable}
        placeholder={isEditable ? placeholder : "Auto-filled from your profile"}
      />
      
      {validationError && (
        <p className="text-sm text-red-400">{validationError}</p>
      )}
    </div>
  );
}