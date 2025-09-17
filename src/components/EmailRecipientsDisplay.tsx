/**
 * Email Recipients Display Component
 * Shows recipients exactly as resolved by the SQL resolve_email_recipients function
 * Aligned with OT Platform Recipients Management
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Mail, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStoreEmailRecipients } from "@/hooks/useStoreEmailRecipients";
import type { EmailType } from '@/services/emailRecipientResolver';

interface EmailRecipientsDisplayProps {
  storeNumber: string;
  emailType: EmailType;
  className?: string;
  showRefresh?: boolean;
}

export const EmailRecipientsDisplay: React.FC<EmailRecipientsDisplayProps> = ({
  storeNumber,
  emailType,
  className = "",
  showRefresh = false
}) => {
  const { 
    recipients, 
    loading, 
    error, 
    refetch, 
    recipientCount, 
    hasRecipients 
  } = useStoreEmailRecipients(storeNumber, emailType);

  const handleRefresh = async () => {
    await refetch();
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Users className="h-4 w-4" />
          Email Recipients
          <Badge variant="secondary" className="ml-2">
            {recipientCount}
          </Badge>
        </CardTitle>
        {showRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">Loading recipients...</span>
          </div>
        ) : error ? (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
            <strong>Error:</strong> {error}
          </div>
        ) : !hasRecipients ? (
          <div className="text-sm text-muted-foreground text-center py-4">
            No recipients configured for {emailType} notifications at store {storeNumber}.
            <br />
            <span className="text-xs">
              Recipients are managed in the OT Platform Recipients Management page.
            </span>
          </div>
        ) : (
          <div className="space-y-2">
            {recipients.map((recipient, index) => (
              <div
                key={`${recipient.email}-${index}`}
                className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
              >
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{recipient.email}</span>
                    {recipient.name && (
                      <span className="text-xs text-muted-foreground">{recipient.name}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={recipient.source === 'store_email_recipients' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {recipient.role}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className="text-xs"
                  >
                    {recipient.source === 'store_email_recipients' ? 'Recipients Mgmt' : 'Platform Users'}
                  </Badge>
                </div>
              </div>
            ))}
            <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Source: SQL resolve_email_recipients function</span>
                <span>Store: {storeNumber} | Type: {emailType}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};