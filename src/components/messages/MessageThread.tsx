
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, User, Building, Mail, Monitor } from "lucide-react";
import type { OrderMessage } from "@/services/messageService";

interface MessageThreadProps {
  messages: OrderMessage[];
  loading: boolean;
}

export function MessageThread({ messages, loading }: MessageThreadProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <MessageSquare className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Loading messages...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (messages.length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <MessageSquare className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">No messages yet</p>
              <p className="text-xs text-gray-400 mt-1">Messages with the warehouse will appear here</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getSourceIcon = (source?: string) => {
    switch (source) {
      case 'email_reply':
        return <Mail className="h-3 w-3" />;
      case 'email_direct':
        return <Mail className="h-3 w-3" />;
      default:
        return <Monitor className="h-3 w-3" />;
    }
  };

  const getSourceLabel = (source?: string) => {
    switch (source) {
      case 'email_reply':
        return 'Email Reply';
      case 'email_direct':
        return 'Email';
      default:
        return 'Platform';
    }
  };

  const getSourceVariant = (source?: string): "default" | "secondary" | "outline" => {
    switch (source) {
      case 'email_reply':
      case 'email_direct':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-gray-600" />
            <h3 className="font-medium text-gray-900">Message History</h3>
            <Badge variant="secondary" className="ml-auto">
              {messages.length} {messages.length === 1 ? 'message' : 'messages'}
            </Badge>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {messages.map((message) => (
              <div key={message.id} className="border-l-4 border-l-blue-200 pl-4 py-2">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {message.sender_role === 'warehouse_admin' ? (
                      <Building className="h-4 w-4 text-blue-600" />
                    ) : (
                      <User className="h-4 w-4 text-green-600" />
                    )}
                    <span className="font-medium text-sm">
                      {message.sender_name || message.sender_email}
                    </span>
                    <Badge 
                      variant={message.sender_role === 'warehouse_admin' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {message.sender_role === 'warehouse_admin' ? 'Warehouse' : 'Store'}
                    </Badge>
                    {message.source && (
                      <Badge 
                        variant={getSourceVariant(message.source)}
                        className="text-xs flex items-center gap-1"
                      >
                        {getSourceIcon(message.source)}
                        {getSourceLabel(message.source)}
                      </Badge>
                    )}
                    {message.email_sent && (
                      <Badge variant="outline" className="text-xs">
                        <Mail className="h-3 w-3 mr-1" />
                        Emailed
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                  </span>
                </div>
                
                <div className="text-sm text-gray-700 bg-gray-50 rounded-md p-3">
                  {message.message_text.split('\n').map((line, index) => (
                    <div key={index}>{line}</div>
                  ))}
                </div>
                
                {message.sender_store && (
                  <div className="text-xs text-gray-500 mt-1">
                    From: {message.sender_store}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
