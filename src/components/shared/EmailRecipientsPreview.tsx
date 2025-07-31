/**
 * Phase 3: Interactive Email Recipients Management Component
 * Transforms from read-only preview to full recipient management UI
 * Supports add/remove operations with real-time updates and comprehensive validation
 */

import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Users, 
  AlertCircle, 
  Loader2, 
  CheckCircle, 
  Plus, 
  X, 
  AlertTriangle,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useEmailRecipientsPreview } from '@/hooks/useEmailRecipientsPreview';
import { RecipientManagementModal } from './RecipientManagementModal';
import type { EmailType, OrderDataInput } from '@/services/emailRecipientResolver';

interface EmailRecipientsPreviewProps {
  store: string;
  plant: string;
  emailType: EmailType;
  orderData?: {
    destination_manager_email?: string;
    manager_email?: string;
    email?: string;
  };
  templateId?: string;
  orderId?: string;
  currentUserEmail?: string;
  currentUserName?: string;
  className?: string;
  onRecipientsChange?: (count: number) => void;
}

export const EmailRecipientsPreview: React.FC<EmailRecipientsPreviewProps> = ({
  store,
  plant,
  emailType,
  orderData = {},
  templateId,
  orderId,
  currentUserEmail = 'user@conlantire.com',
  currentUserName = 'Current User',
  className = "",
  onRecipientsChange
}) => {
  const { toast } = useToast();
  
  // Modal state
  const [showModal, setShowModal] = useState(false);

  // Build order data for the hook
  const orderDataInput: OrderDataInput = {
    store,
    plant,
    destination_manager_email: orderData.destination_manager_email,
    manager_email: orderData.manager_email,
    email: orderData.email
  };

  const {
    recipients,
    defaultRecipients,
    customRecipients,
    removedDefaults,
    loading,
    error,
    source,
    recipientCount,
    hasRecipients,
    addRecipient,
    removeRecipient,
    resetToDefaults,
    canAddRecipient,
    isDefaultRecipient,
    isCustomRecipient,
    isRemovedDefault
  } = useEmailRecipientsPreview(orderDataInput, emailType, {
    templateId,
    orderId,
    enabled: true
  });

  // Notify parent component of recipient count changes
  useEffect(() => {
    onRecipientsChange?.(recipientCount);
  }, [recipientCount, onRecipientsChange]);

  // Validate zero recipients
  useEffect(() => {
    if (!loading && !hasRecipients && store) {
      toast({
        title: "⚠️ No Recipients",
        description: "You must have at least one email recipient to submit this order.",
        variant: "destructive"
      });
    }
  }, [loading, hasRecipients, store, toast]);

  /**
   * Handle adding recipient through modal
   */
  const handleModalAddRecipient = async (email: string, name: string, role: string) => {
    try {
      const result = await addRecipient(
        email.trim(),
        name.trim(),
        role,
        currentUserEmail,
        currentUserName
      );

      return result;

    } catch (error) {
      console.error('Error in modal add recipient:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to add recipient" 
      };
    }
  };

  const handleRemoveRecipient = async (email: string, recipientName: string) => {
    const isDefault = isDefaultRecipient(email);
    
    // Show warning for default recipients
    if (isDefault) {
      toast({
        title: "⚠️ Removing Default Recipient",
        description: `You are removing ${recipientName}, a system default recipient. This may affect order notifications.`,
        variant: "default"
      });
    }

    try {
      const result = await removeRecipient(email, currentUserEmail, currentUserName);

      if (result.success) {
        toast({
          title: "✅ Recipient Removed",
          description: `${recipientName} has been removed from the recipient list.`,
          variant: "default"
        });
      } else {
        toast({
          title: "Failed to Remove Recipient",
          description: result.error || "An unexpected error occurred.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error Removing Recipient",
        description: "Please try again or contact support if the problem persists.",
        variant: "destructive"
      });
    }
  };

  const handleResetToDefaults = async () => {
    try {
      const result = await resetToDefaults(currentUserEmail);

      if (result.success) {
        toast({
          title: "✅ Reset Complete",
          description: "Recipients have been reset to system defaults.",
          variant: "default"
        });
      } else {
        toast({
          title: "Failed to Reset",
          description: result.error || "An unexpected error occurred.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error Resetting Recipients",
        description: "Please try again or contact support if the problem persists.",
        variant: "destructive"
      });
    }
  };

  const getRecipientBadge = (email: string) => {
    if (isCustomRecipient(email)) {
      const customRecipient = customRecipients.find(r => r.email === email);
      return (
        <Badge variant="default" className="text-xs bg-green-100 text-green-800 border-green-300">
          Added by {currentUserName}
        </Badge>
      );
    } else if (isDefaultRecipient(email)) {
      return (
        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 border-blue-300">
          <Shield className="h-3 w-3 mr-1" />
          Default
        </Badge>
      );
    }
    return null;
  };

  const getSourceBadgeVariant = (source: string) => {
    switch (source) {
      case 'order_fields':
        return 'default';
      case 'store_email_recipients':
        return 'secondary';
      case 'ot_platform_users':
        return 'outline';
      case 'management_service':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'order_fields':
        return 'Order-Specific';
      case 'store_email_recipients':
        return 'Store Configuration';
      case 'ot_platform_users':
        return 'Platform Users';
      case 'management_service':
        return 'Managed Recipients';
      default:
        return 'Unknown';
    }
  };

  return (
    <Card className={`border-blue-200 bg-blue-50 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-blue-600" />
            <h4 className="text-sm font-medium text-blue-900">Email Recipients Management</h4>
          </div>
          <div className="flex items-center space-x-2">
            {(customRecipients.length > 0 || removedDefaults.length > 0) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetToDefaults}
                className="text-xs text-gray-600 hover:text-gray-800"
              >
                Reset to Defaults
              </Button>
            )}
            {source && (
              <Badge variant={getSourceBadgeVariant(source)} className="text-xs">
                {getSourceLabel(source)}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        {loading && (
          <div className="flex items-center space-x-2 text-blue-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading recipients...</span>
          </div>
        )}

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {!loading && !error && !hasRecipients && store && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>⚠️ No Recipients:</strong> You must add at least one email recipient before submitting this order.
            </AlertDescription>
          </Alert>
        )}

        {!loading && !error && hasRecipients && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-green-700">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {recipientCount} recipient{recipientCount !== 1 ? 's' : ''} will be notified
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowModal(true)}
                className="text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Recipient
              </Button>
            </div>
            
            <div className="space-y-2">
              {recipients.map((recipient, index) => (
                <div 
                  key={`${recipient.email}-${index}`}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100 shadow-sm"
                >
                  <div className="flex items-center space-x-3">
                    <Users className="h-4 w-4 text-blue-500" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {recipient.name || 'Unknown Name'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {recipient.email}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {recipient.role}
                    </Badge>
                    {getRecipientBadge(recipient.email)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveRecipient(recipient.email, recipient.name || 'Unknown')}
                      className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Recipient Button (when no recipients) */}
        {!loading && !error && !hasRecipients && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowModal(true)}
              className="text-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Recipient
            </Button>
          </div>
        )}

        {/* Add Recipient Button (when recipients exist) */}
        {!loading && !error && hasRecipients && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowModal(true)}
              className="text-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Recipient
            </Button>
          </div>
        )}

        {/* Footer Information */}
        {!loading && hasRecipients && (
          <div className="pt-3 border-t border-blue-100">
            <p className="text-xs text-blue-600">
              These recipients will receive a <strong>{emailType.replace('_', ' ')}</strong> notification 
              when you submit this order.
            </p>
            {(customRecipients.length > 0 || removedDefaults.length > 0) && (
              <p className="text-xs text-gray-500 mt-1">
                {customRecipients.length} custom recipient{customRecipients.length !== 1 ? 's' : ''} added
                {removedDefaults.length > 0 && `, ${removedDefaults.length} default${removedDefaults.length !== 1 ? 's' : ''} removed`}
              </p>
            )}
          </div>
        )}
      </CardContent>

      {/* Recipient Management Modal */}
      <RecipientManagementModal
        open={showModal}
        onOpenChange={setShowModal}
        onAddRecipient={handleModalAddRecipient}
        currentStore={store}
        currentPlant={plant}
        existingEmails={recipients.map(r => r.email.toLowerCase())}
      />
    </Card>
  );
};