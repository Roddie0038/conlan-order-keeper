/**
 * Email Validation Utilities
 * Comprehensive email validation and domain checking
 */

// Supported email domains for the organization
const SUPPORTED_DOMAINS = [
  'conlantire.com',
  'gmail.com',
  'outlook.com', 
  'hotmail.com',
  'yahoo.com',
  'icloud.com',
  'aol.com'
];

// Common typos and their corrections
const DOMAIN_CORRECTIONS = {
  'comlantire.com': 'conlantire.com',
  'conlanttire.com': 'conlantire.com',
  'conlantires.com': 'conlantire.com',
  'conlantire.co': 'conlantire.com',
  'gmai.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'yahooo.com': 'yahoo.com',
  'outlok.com': 'outlook.com'
};

export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
  suggestion?: string;
  correctedEmail?: string;
}

/**
 * Comprehensive email validation
 */
export function validateEmail(email: string): EmailValidationResult {
  // Trim and normalize
  email = email.trim().toLowerCase();
  
  // Basic format validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Invalid email format. Please enter a valid email address.'
    };
  }

  // Extract domain
  const domain = email.split('@')[1];
  
  // Check for domain corrections
  if (DOMAIN_CORRECTIONS[domain]) {
    const correctedEmail = email.replace(domain, DOMAIN_CORRECTIONS[domain]);
    return {
      isValid: true,
      suggestion: `Did you mean ${correctedEmail}?`,
      correctedEmail
    };
  }

  // Check supported domains (for strict validation)
  if (!SUPPORTED_DOMAINS.includes(domain)) {
    return {
      isValid: false,
      error: `Email domain "${domain}" is not supported. Please use a company email or supported domain.`
    };
  }

  // Additional validation rules
  const localPart = email.split('@')[0];
  
  // Check local part length
  if (localPart.length < 1 || localPart.length > 64) {
    return {
      isValid: false,
      error: 'Email address local part is too long or too short.'
    };
  }

  // Check for consecutive dots
  if (email.includes('..')) {
    return {
      isValid: false,
      error: 'Email address cannot contain consecutive dots.'
    };
  }

  // Check for leading/trailing dots
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return {
      isValid: false,
      error: 'Email address cannot start or end with a dot.'
    };
  }

  return { isValid: true };
}

/**
 * Check if email already exists in recipient lists
 */
export function checkDuplicateEmail(
  email: string, 
  existingEmails: string[], 
  removedDefaults: string[] = [],
  defaultEmails: string[] = []
): { isDuplicate: boolean; type?: 'existing' | 'removed_default'; message?: string } {
  email = email.trim().toLowerCase();
  
  // Check if already in current recipients
  if (existingEmails.some(existing => existing.toLowerCase() === email)) {
    return {
      isDuplicate: true,
      type: 'existing',
      message: 'This email address is already in the recipient list.'
    };
  }

  // Check if it's a removed default (prevent re-adding until reset)
  if (removedDefaults.some(removed => removed.toLowerCase() === email)) {
    return {
      isDuplicate: true,
      type: 'removed_default',
      message: 'This email was previously removed as a default recipient. Use "Reset to Defaults" to restore it.'
    };
  }

  return { isDuplicate: false };
}

/**
 * Batch validate multiple emails
 */
export function validateEmailBatch(emails: string[]): {
  valid: string[];
  invalid: { email: string; error: string }[];
  suggestions: { original: string; suggested: string }[];
} {
  const valid: string[] = [];
  const invalid: { email: string; error: string }[] = [];
  const suggestions: { original: string; suggested: string }[] = [];

  emails.forEach(email => {
    const result = validateEmail(email);
    
    if (result.isValid) {
      if (result.suggestion && result.correctedEmail) {
        suggestions.push({
          original: email,
          suggested: result.correctedEmail
        });
      }
      valid.push(result.correctedEmail || email);
    } else {
      invalid.push({
        email,
        error: result.error || 'Invalid email'
      });
    }
  });

  return { valid, invalid, suggestions };
}

/**
 * Sanitize email for safe processing
 */
export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase().replace(/[^\w@.-]/g, '');
}

/**
 * Check if email belongs to system defaults
 */
export function isSystemDefaultEmail(email: string, defaultEmails: string[]): boolean {
  email = email.trim().toLowerCase();
  return defaultEmails.some(defaultEmail => defaultEmail.toLowerCase() === email);
}