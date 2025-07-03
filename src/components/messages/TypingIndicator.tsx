import React from 'react';
import { TypingStatus } from '@/services/advancedMessageService';
import { Badge } from '@/components/ui/badge';

interface TypingIndicatorProps {
  users: TypingStatus[];
}

export function TypingIndicator({ users }: TypingIndicatorProps) {
  if (users.length === 0) return null;

  const userNames = users.map(u => u.user_name || u.user_email).join(', ');

  return (
    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
      <span>{userNames} {users.length === 1 ? 'is' : 'are'} typing...</span>
    </div>
  );
}