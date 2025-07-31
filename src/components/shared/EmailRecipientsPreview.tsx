/**
 * EmailRecipientsPreview Component
 * Shows users exactly who will receive email notifications before form submission
 * Implements real-time recipient lookup using the three-tier fallback system
 */

import React, { useEffect, useState } from 'react';
import { Mail, Users, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { resolveEmailRecipients } from '@/services/emailRecipientResolver';
import type { EmailRecipient, EmailType } from '@/services/emailRecipientResolver';

interface EmailRecipientsPreviewProps {
  store: string;
  plant: string;
  emailType: EmailType;
  orderData?: {
    destination_manager_email?: string;
    manager_email?: string;
    email?: string;
  };
  className?: string;
}

export const EmailRecipientsPreview: React.FC<EmailRecipientsPreviewProps> = ({
  store,
  plant,
  emailType,
  orderData = {},
  className = ""
}) => {
  const [recipients, setRecipients] = useState<EmailRecipient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<string>('');

  useEffect(() => {
    const fetchRecipients = async () => {
      if (!store || !emailType) {
        setRecipients([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await resolveEmailRecipients(
          {
            store: store,
            store_number: store,
            plant: plant,
            destination_manager_email: orderData.destination_manager_email,
            manager_email: orderData.manager_email,
            email: orderData.email
          },
          emailType
        );

        setRecipients(result.recipients);
        setSource(result.source);
      } catch (err) {
        console.error('Error fetching email recipients:', err);
        setError('Failed to load recipient information');
        setRecipients([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipients();
  }, [store, plant, emailType, orderData.destination_manager_email, orderData.manager_email, orderData.email]);

  const getSourceBadgeVariant = (source: string) => {
    switch (source) {
      case 'order_fields':
        return 'default';
      case 'store_recipients':
        return 'secondary';
      case 'ot_platform_users':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'order_fields':
        return 'Order-Specific';
      case 'store_recipients':
        return 'Store Configuration';
      case 'ot_platform_users':
        return 'Platform Users';
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
            <h4 className="text-sm font-medium text-blue-900">Email Recipients Preview</h4>
          </div>
          {source && (
            <Badge variant={getSourceBadgeVariant(source)} className="text-xs">
              {getSourceLabel(source)}
            </Badge>
          )}
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

        {!loading && !error && recipients.length === 0 && store && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              No email recipients found for {store}. Please contact your system administrator.
            </AlertDescription>
          </Alert>
        )}

        {!loading && !error && recipients.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                {recipients.length} recipient{recipients.length !== 1 ? 's' : ''} will be notified
              </span>
            </div>
            
            <div className="space-y-2">
              {recipients.map((recipient, index) => (
                <div 
                  key={index}
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
                  <div className="flex space-x-1">
                    <Badge variant="outline" className="text-xs">
                      {recipient.role}
                    </Badge>
                    {recipient.store && (
                      <Badge variant="secondary" className="text-xs">
                        {recipient.store}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-2 border-t border-blue-100">
              <p className="text-xs text-blue-600">
                These recipients will receive a <strong>{emailType.replace('_', ' ')}</strong> notification 
                when you submit this order.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};