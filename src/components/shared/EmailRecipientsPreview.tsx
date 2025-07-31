/**
 * Email Recipients Preview Component with Management
 * Shows real-time preview of email recipients with add/remove capabilities for all users
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Users, AlertCircle, Plus, X, RotateCcw, UserPlus, Mail, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useEmailRecipientsPreview } from '@/hooks/useEmailRecipientsPreview';
import type { EmailType, OrderDataInput, EmailRecipient } from '@/services/emailRecipientResolver';

interface EmailRecipientsPreviewProps {
  store: string;
  plant: string;
  emailType: EmailType;
  orderData?: OrderDataInput;
  className?: string;
  allowManagement?: boolean;
  orderId?: string;
  templateId?: string;
  onRecipientsChange?: (recipients: EmailRecipient[]) => void;
}

export const EmailRecipientsPreview: React.FC<EmailRecipientsPreviewProps> = ({
  store,
  plant,
  emailType,
  orderData,
  className = "",
  allowManagement = false,
  orderId,
  templateId,
  onRecipientsChange
}) => {
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newRecipientEmail, setNewRecipientEmail] = useState('');
  const [newRecipientName, setNewRecipientName] = useState('');
  const [newRecipientRole, setNewRecipientRole] = useState('custom');

  const {
    recipients,
    loading,
    error,
    source,
    refetch,
    recipientCount,
    hasRecipients,
    defaultRecipients,
    customRecipients,
    removedDefaults,
    hasCustomizations,
    addRecipient,
    removeRecipient,
    resetToDefaults,
    managementLoading
  } = useEmailRecipientsPreview(
    orderData ? { 
      store_number: store, 
      store: store, 
      plant: plant, 
      ...orderData 
    } : null,
    emailType,
    {
      allowManagement,
      orderId,
      templateId,
      enabled: !!store && !!emailType
    }
  );

  // Notify parent of recipient changes
  React.useEffect(() => {
    if (onRecipientsChange) {
      onRecipientsChange(recipients);
    }
  }, [recipients, onRecipientsChange]);

  const handleAddRecipient = async () => {
    if (!newRecipientEmail.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter an email address",
        variant: "destructive"
      });
      return;
    }

    const success = await addRecipient({
      email: newRecipientEmail.trim(),
      name: newRecipientName.trim() || undefined,
      role: newRecipientRole
    });

    if (success) {
      toast({
        title: "Recipient Added",
        description: `${newRecipientEmail} has been added to the recipient list`,
      });
      setNewRecipientEmail('');
      setNewRecipientName('');
      setNewRecipientRole('custom');
      setShowAddDialog(false);
    } else {
      toast({
        title: "Failed to Add Recipient",
        description: error || "Please check the email address and try again",
        variant: "destructive"
      });
    }
  };

  const handleRemoveRecipient = async (email: string) => {
    const isDefault = defaultRecipients.some(r => r.email === email);
    
    const success = await removeRecipient(email);
    
    if (success) {
      const message = isDefault 
        ? `Removed default recipient: ${email}` 
        : `Removed custom recipient: ${email}`;
      
      toast({
        title: "Recipient Removed",
        description: message,
      });
    } else {
      toast({
        title: "Failed to Remove Recipient",
        description: error || "Please try again",
        variant: "destructive"
      });
    }
  };

  const handleResetToDefaults = async () => {
    await resetToDefaults();
    toast({
      title: "Reset Complete",
      description: "Recipient list has been reset to defaults",
    });
  };

  const getRecipientBadgeVariant = (recipient: EmailRecipient): "default" | "secondary" | "outline" => {
    const isDefault = defaultRecipients.some(r => r.email === recipient.email);
    const isCustom = customRecipients.some(r => r.email === recipient.email);
    
    if (isDefault && !isCustom) return "default";
    if (isCustom) return "secondary";
    return "outline";
  };

  const getRecipientLabel = (recipient: EmailRecipient): string => {
    const isDefault = defaultRecipients.some(r => r.email === recipient.email);
    const isCustom = customRecipients.some(r => r.email === recipient.email);
    
    if (isDefault && !isCustom) return "Default";
    if (isCustom) return "Added";
    return "System";
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'order_fields':
        return 'Order-Specific';
      case 'store_email_recipients':
        return 'Store Configuration';
      case 'ot_platform_users':
        return 'Platform Users';
      default:
        return 'System';
    }
  };

  return (
    <Card className={`border-blue-200 bg-blue-50 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-blue-600" />
            <CardTitle className="text-sm font-medium text-blue-900">
              Email Recipients Preview
            </CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            {source && (
              <Badge variant="outline" className="text-xs">
                {getSourceLabel(source)}
              </Badge>
            )}
            {hasCustomizations && (
              <Badge variant="secondary" className="text-xs">
                Customized
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
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

        {!loading && !error && recipientCount === 0 && store && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              No email recipients found for {store}. Add at least one recipient before submitting.
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
              
              {allowManagement && (
                <div className="flex items-center space-x-1">
                  <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="text-xs">
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Email Recipient</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Email Address *</label>
                          <Input
                            type="email"
                            placeholder="user@conlantire.com"
                            value={newRecipientEmail}
                            onChange={(e) => setNewRecipientEmail(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Name</label>
                          <Input
                            placeholder="Full Name"
                            value={newRecipientName}
                            onChange={(e) => setNewRecipientName(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Role</label>
                          <Select value={newRecipientRole} onValueChange={setNewRecipientRole}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="custom">Custom</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="supervisor">Supervisor</SelectItem>
                              <SelectItem value="coordinator">Coordinator</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            onClick={() => setShowAddDialog(false)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleAddRecipient}
                            disabled={managementLoading}
                          >
                            {managementLoading && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                            Add Recipient
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  {hasCustomizations && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-xs"
                      onClick={handleResetToDefaults}
                      disabled={managementLoading}
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Reset
                    </Button>
                  )}
                </div>
              )}
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {recipients.map((recipient, index) => (
                <div 
                  key={`${recipient.email}-${index}`}
                  className="flex items-center justify-between p-2 bg-white rounded border border-blue-100"
                >
                  <div className="flex items-center space-x-2">
                    <Users className="h-3 w-3 text-blue-500" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {recipient.name || 'Unknown Name'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {recipient.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Badge variant={getRecipientBadgeVariant(recipient)} className="text-xs">
                      {getRecipientLabel(recipient)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {recipient.role}
                    </Badge>
                    {allowManagement && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        onClick={() => handleRemoveRecipient(recipient.email)}
                        disabled={managementLoading}
                        title={`Remove ${recipient.email}`}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {removedDefaults.length > 0 && (
              <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                <p className="text-xs text-yellow-800">
                  ⚠️ You removed {removedDefaults.length} default recipient{removedDefaults.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}

            <div className="mt-3 pt-2 border-t border-blue-100">
              <p className="text-xs text-blue-600">
                These recipients will receive a <strong>{emailType.replace('_', ' ')}</strong> notification 
                when you submit this order.
              </p>
            </div>
          </div>
        )}

        {!allowManagement && recipientCount === 0 && (
          <div className="text-center py-4">
            <UserPlus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              Contact your administrator to configure email recipients for this store.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};