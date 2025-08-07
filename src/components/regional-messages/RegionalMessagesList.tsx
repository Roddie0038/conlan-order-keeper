import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Globe, Search, Users, Clock, CheckCircle2, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { RegionalMessageWithRecipients } from "@/types/regionalMessages";
import { useAuth } from "@/contexts/AuthContext";

interface RegionalMessagesListProps {
  messages: RegionalMessageWithRecipients[];
  loading: boolean;
  onMarkAsRead: (messageId: string) => Promise<void>;
}

export function RegionalMessagesList({ 
  messages, 
  loading, 
  onMarkAsRead 
}: RegionalMessagesListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<RegionalMessageWithRecipients | null>(null);
  const { user } = useAuth();

  // Filter messages based on search query
  const filteredMessages = messages.filter(message =>
    message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.created_by.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewMessage = async (message: RegionalMessageWithRecipients) => {
    setSelectedMessage(message);
    
    // Check if current user has read this message
    const userRecipient = message.recipients.find(r => r.user_email === user?.email);
    if (userRecipient && !userRecipient.read_at) {
      await onMarkAsRead(message.id);
    }
  };

  const isMessageRead = (message: RegionalMessageWithRecipients) => {
    const userRecipient = message.recipients.find(r => r.user_email === user?.email);
    return userRecipient?.read_at != null;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search regional messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Messages List */}
        {filteredMessages.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? "No messages found" : "No regional messages"}
              </h3>
              <p className="text-gray-500">
                {searchQuery 
                  ? "Try adjusting your search terms" 
                  : "Regional messages will appear here when they are sent"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredMessages.map((message) => {
              const isRead = isMessageRead(message);
              
              return (
                <Card 
                  key={message.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    !isRead ? 'ring-2 ring-blue-200 bg-blue-50/50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleViewMessage(message)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className={`font-medium truncate ${!isRead ? 'font-semibold' : ''}`}>
                            {message.subject}
                          </h3>
                          {!isRead && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              NEW
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {message.body}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {message.total_recipients} recipients
                            </span>
                            {message.unread_count > 0 && (
                              <span className="flex items-center gap-1 text-blue-600">
                                <Eye className="h-3 w-3" />
                                {message.unread_count} unread
                              </span>
                            )}
                          </div>
                          <span>From: {message.created_by}</span>
                        </div>
                      </div>
                      
                      <div className="ml-4 flex-shrink-0">
                        {isRead ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Message Detail Dialog */}
      {selectedMessage && (
        <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {selectedMessage.subject}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="space-y-1">
                  <p className="text-sm font-medium">From: {selectedMessage.created_by}</p>
                  <p className="text-xs text-gray-500">
                    Sent {formatDistanceToNow(new Date(selectedMessage.created_at), { addSuffix: true })}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm text-gray-600">
                    {selectedMessage.total_recipients} recipients
                  </p>
                  {selectedMessage.unread_count > 0 && (
                    <p className="text-xs text-blue-600">
                      {selectedMessage.unread_count} unread
                    </p>
                  )}
                </div>
              </div>
              
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 p-4 bg-white border rounded-lg">
                  {selectedMessage.body}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}