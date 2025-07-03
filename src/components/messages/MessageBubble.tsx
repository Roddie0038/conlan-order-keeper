import React from 'react';
import { OrderMessage } from '@/services/advancedMessageService';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: OrderMessage;
  onMarkAsRead: (messageIds: string[]) => void;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const { user } = useAuth();
  const isOwnMessage = message.sender_email === user?.email;

  return (
    <div className={cn("flex", isOwnMessage ? "justify-end" : "justify-start")}>
      <div className={cn(
        "max-w-[70%] rounded-lg p-3 space-y-2",
        isOwnMessage 
          ? "bg-blue-500 text-white" 
          : "bg-gray-100 text-gray-900"
      )}>
        {!isOwnMessage && (
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium opacity-75">
              {message.sender_name || message.sender_email}
            </span>
            {message.priority !== 'normal' && (
              <Badge variant="outline" className="text-xs">
                {message.priority}
              </Badge>
            )}
          </div>
        )}
        
        <div className="text-sm whitespace-pre-wrap">
          {message.message_text}
        </div>
        
        {message.attachments && message.attachments.length > 0 && (
          <div className="space-y-1">
            {message.attachments.map((attachment: any, index: number) => (
              <div key={index} className="text-xs opacity-75">
                📎 {attachment.file_name}
              </div>
            ))}
          </div>
        )}
        
        <div className="text-xs opacity-75">
          {new Date(message.created_at).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}