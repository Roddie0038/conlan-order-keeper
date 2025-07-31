/**
 * Phase 4: Recipient Management Modal
 * Comprehensive modal for adding email recipients with live validation,
 * user search, preview, and accessibility features
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  UserPlus, 
  Search, 
  Mail, 
  User, 
  Building, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  X,
  Eye
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PlatformUser {
  email: string;
  full_name: string;
  role: string;
  store: string;
  plant: string;
}

interface RecipientPreview {
  email: string;
  name: string;
  role: string;
  store?: string;
  plant?: string;
  isValid: boolean;
  validationMessage?: string;
}

interface RecipientManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddRecipient: (email: string, name: string, role: string) => Promise<{ success: boolean; error?: string }>;
  currentStore: string;
  currentPlant: string;
  existingEmails: string[];
}

const ROLE_OPTIONS = [
  { value: 'store_manager', label: 'Store Manager' },
  { value: 'warehouse_manager', label: 'Warehouse Manager' },
  { value: 'plant_manager', label: 'Plant Manager' },
  { value: 'operations_manager', label: 'Operations Manager' },
  { value: 'service_manager', label: 'Service Manager' },
  { value: 'retread_manager', label: 'Retread Manager' },
  { value: 'warehouse_coordinator', label: 'Warehouse Coordinator' },
  { value: 'office_manager', label: 'Office Manager' },
  { value: 'admin', label: 'Administrator' },
  { value: 'custom', label: 'Custom Role' }
];

export const RecipientManagementModal: React.FC<RecipientManagementModalProps> = ({
  open,
  onOpenChange,
  onAddRecipient,
  currentStore,
  currentPlant,
  existingEmails
}) => {
  const { toast } = useToast();
  
  // Form state
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<PlatformUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [preview, setPreview] = useState<RecipientPreview | null>(null);
  
  // Validation state
  const [emailError, setEmailError] = useState('');
  const [roleError, setRoleError] = useState('');

  /**
   * Reset form when modal closes
   */
  useEffect(() => {
    if (!open) {
      setEmail('');
      setName('');
      setRole('');
      setSearchQuery('');
      setSearchResults([]);
      setPreview(null);
      setEmailError('');
      setRoleError('');
      setShowUserSearch(false);
    }
  }, [open]);

  /**
   * Live email validation
   */
  const validateEmail = useCallback((emailValue: string): { valid: boolean; error?: string } => {
    if (!emailValue.trim()) {
      return { valid: false, error: 'Email is required' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) {
      return { valid: false, error: 'Invalid email format' };
    }

    const allowedDomains = ['@conlantire.com', '@aol.com'];
    const normalizedEmail = emailValue.toLowerCase().trim();
    const isValidDomain = allowedDomains.some(domain => normalizedEmail.endsWith(domain));
    
    if (!isValidDomain) {
      return { 
        valid: false, 
        error: 'Only @conlantire.com and @aol.com email addresses are allowed' 
      };
    }

    if (existingEmails.includes(normalizedEmail)) {
      return { valid: false, error: 'This email is already added as a recipient' };
    }

    return { valid: true };
  }, [existingEmails]);

  /**
   * Update preview when form changes
   */
  useEffect(() => {
    if (email || name || role) {
      const emailValidation = validateEmail(email);
      const isRoleValid = !!role;

      setPreview({
        email: email.trim(),
        name: name.trim() || 'No name provided',
        role: role || 'No role selected',
        store: currentStore,
        plant: currentPlant,
        isValid: emailValidation.valid && isRoleValid,
        validationMessage: !emailValidation.valid ? emailValidation.error : 
                          !isRoleValid ? 'Please select a role' : undefined
      });
    } else {
      setPreview(null);
    }
  }, [email, name, role, currentStore, currentPlant, validateEmail]);

  /**
   * Handle email input changes with live validation
   */
  const handleEmailChange = (value: string) => {
    setEmail(value);
    
    if (value.trim()) {
      const validation = validateEmail(value);
      setEmailError(validation.valid ? '' : validation.error || '');
    } else {
      setEmailError('');
    }
  };

  /**
   * Handle role selection
   */
  const handleRoleChange = (value: string) => {
    setRole(value);
    setRoleError(value ? '' : 'Please select a role');
  };

  /**
   * Search platform users
   */
  const searchPlatformUsers = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    try {
      const { data: users, error } = await supabase
        .from('ot_platform_users')
        .select('email, full_name, role, store, plant')
        .eq('status', 'active')
        .or(`email.ilike.%${query}%,full_name.ilike.%${query}%`)
        .limit(10);

      if (error) {
        console.error('Error searching users:', error);
        toast({
          title: "Search Error",
          description: "Failed to search platform users. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Filter out existing recipients
      const filteredUsers = (users || []).filter(user => 
        !existingEmails.includes(user.email.toLowerCase())
      );

      setSearchResults(filteredUsers);

    } catch (error) {
      console.error('Error in user search:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [existingEmails, toast]);

  /**
   * Handle search input changes with debouncing
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchPlatformUsers(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchPlatformUsers]);

  /**
   * Select user from search results
   */
  const selectUser = (user: PlatformUser) => {
    setEmail(user.email);
    setName(user.full_name);
    setRole(user.role);
    setSearchQuery('');
    setSearchResults([]);
    setShowUserSearch(false);
    setEmailError('');
    setRoleError('');
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async () => {
    // Final validation
    const emailValidation = validateEmail(email);
    const isRoleValid = !!role;

    if (!emailValidation.valid) {
      setEmailError(emailValidation.error || 'Invalid email');
      return;
    }

    if (!isRoleValid) {
      setRoleError('Please select a role');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await onAddRecipient(
        email.trim(),
        name.trim() || 'Unknown Name',
        role
      );

      if (result.success) {
        toast({
          title: "✅ Recipient Added",
          description: `${name || email} has been added successfully.`,
          variant: "default"
        });
        onOpenChange(false);
      } else {
        toast({
          title: "Failed to Add Recipient",
          description: result.error || "An unexpected error occurred.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error Adding Recipient",
        description: "Please try again or contact support if the problem persists.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Check if form is valid for submission
   */
  const isFormValid = preview?.isValid && !emailError && !roleError;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5 text-blue-600" />
            <span>Add Email Recipient</span>
          </DialogTitle>
          <DialogDescription>
            Add a new recipient to receive email notifications for this order type.
            You can search for existing platform users or manually enter details.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* User Search Toggle */}
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Add Recipient</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUserSearch(!showUserSearch)}
              className="text-xs"
            >
              <Search className="h-3 w-3 mr-1" />
              {showUserSearch ? 'Manual Entry' : 'Search Users'}
            </Button>
          </div>

          {/* User Search Section */}
          {showUserSearch && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="user-search" className="text-sm font-medium">
                  Search Platform Users
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="user-search"
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                  )}
                </div>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="max-h-40 overflow-y-auto border rounded-md">
                  {searchResults.map((user) => (
                    <div
                      key={user.email}
                      onClick={() => selectUser(user)}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                    >
                      <div className="flex items-center space-x-3">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium">{user.full_name}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {user.role}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {user.store}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {searchQuery && !isSearching && searchResults.length === 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No users found matching "{searchQuery}". Try a different search term or add manually below.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Manual Entry Form */}
          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <Label htmlFor="recipient-email" className="text-sm font-medium">
                Email Address *
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="recipient-email"
                  type="email"
                  placeholder="user@conlantire.com"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className={`pl-10 ${emailError ? 'border-red-500' : ''}`}
                  aria-describedby={emailError ? 'email-error' : 'email-help'}
                />
              </div>
              {emailError ? (
                <p id="email-error" className="text-xs text-red-600 mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {emailError}
                </p>
              ) : (
                <p id="email-help" className="text-xs text-gray-500 mt-1">
                  Only @conlantire.com and @aol.com email addresses are allowed
                </p>
              )}
            </div>

            {/* Name Field */}
            <div>
              <Label htmlFor="recipient-name" className="text-sm font-medium">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="recipient-name"
                  type="text"
                  placeholder="John Doe (optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Optional - helps identify the recipient
              </p>
            </div>

            {/* Role Field */}
            <div>
              <Label htmlFor="recipient-role" className="text-sm font-medium">
                Role *
              </Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <Select value={role} onValueChange={handleRoleChange}>
                  <SelectTrigger 
                    className={`pl-10 ${roleError ? 'border-red-500' : ''}`}
                    aria-describedby={roleError ? 'role-error' : undefined}
                  >
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border shadow-lg z-50">
                    {ROLE_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {roleError && (
                <p id="role-error" className="text-xs text-red-600 mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {roleError}
                </p>
              )}
            </div>
          </div>

          {/* Preview Section */}
          {preview && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4 text-gray-600" />
                <Label className="text-sm font-medium">Preview</Label>
              </div>
              <Card className={`border ${preview.isValid ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium">{preview.name}</div>
                        <div className="text-xs text-gray-500">{preview.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {preview.role}
                      </Badge>
                      {preview.isValid ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                      )}
                    </div>
                  </div>
                  {preview.validationMessage && (
                    <div className="mt-2 text-xs text-yellow-700">
                      {preview.validationMessage}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className="min-w-[100px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Recipient
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};