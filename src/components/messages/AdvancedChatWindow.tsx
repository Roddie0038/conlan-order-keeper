import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Send, 
  Paperclip, 
  Image, 
  FileText, 
  Download,
  Users,
  Clock,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { useAdvancedOrderMessages } from '@/hooks/useAdvancedOrderMessages';
import { MessageTemplate } from '@/services/advancedMessageService';
import { FileUploadZone } from './FileUploadZone';
import { TypingIndicator } from './TypingIndicator';
import { MessageBubble } from './MessageBubble';
import { QuickReplyTemplates } from './QuickReplyTemplates';
import { cn } from '@/lib/utils';

interface AdvancedChatWindowProps {
  open: boolean;
  onClose: () => void;
  orderId: string;
  orderType: 'orders' | 'mto_orders' | 'wheel_orders';
  orderNumber: string;
  storeName: string;
}

export function AdvancedChatWindow({
  open,
  onClose,
  orderId,
  orderType,
  orderNumber,
  storeName
}: AdvancedChatWindowProps) {
  const [message, setMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    messages,
    messageCount,
    loading,
    sending,
    uploading,
    typingUsers,
    templates,
    isTyping,
    setIsTyping,
    sendMessage,
    markAsRead,
    useTemplate
  } = useAdvancedOrderMessages(orderId, orderType);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, typingUsers]);

  // Focus textarea when dialog opens
  useEffect(() => {
    if (open && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [open]);

  const handleSend = async () => {
    if (!message.trim() && selectedFiles.length === 0) return;
    
    const success = await sendMessage(message, selectedFiles, priority);
    if (success) {
      setMessage('');
      setSelectedFiles([]);
      setPriority('normal');
      setShowFileUpload(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (value: string) => {
    setMessage(value);
    
    // Update typing status
    const nowTyping = value.trim().length > 0;
    if (nowTyping !== isTyping) {
      setIsTyping(nowTyping);
    }
  };

  const handleTemplateSelect = async (template: MessageTemplate) => {
    const content = await useTemplate(template.id);
    if (content) {
      setMessage(content);
      setShowTemplates(false);
      textareaRef.current?.focus();
    }
  };

  const handleFileSelect = (files: File[]) => {
    setSelectedFiles(prev => [...prev, ...files]);
    setShowFileUpload(false);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleClose = () => {
    setMessage('');
    setSelectedFiles([]);
    setPriority('normal');
    setIsTyping(false);
    setShowFileUpload(false);
    setShowTemplates(false);
    onClose();
  };

  const getPriorityIcon = (level: string) => {
    switch (level) {
      case 'urgent': return <Zap className="h-3 w-3" />;
      case 'high': return <AlertTriangle className="h-3 w-3" />;
      default: return null;
    }
  };

  const getPriorityColor = (level: string) => {
    switch (level) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'low': return 'bg-gray-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] p-0 overflow-hidden flex flex-col">
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between p-4 border-b bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <DialogTitle className="text-lg font-semibold">
                Order #{orderNumber}
              </DialogTitle>
              <Badge variant="outline" className="text-xs">
                {storeName}
              </Badge>
            </div>
            
            {messageCount > 0 && (
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{messageCount} messages</span>
              </div>
            )}
          </div>
          
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <MessageBubble 
                key={msg.id} 
                message={msg} 
                onMarkAsRead={markAsRead}
              />
            ))
          )}
          
          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <TypingIndicator users={typingUsers} />
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* File Upload Zone */}
        {showFileUpload && (
          <div className="p-4 border-t bg-slate-50">
            <FileUploadZone 
              onFilesSelected={handleFileSelect}
              onCancel={() => setShowFileUpload(false)}
            />
          </div>
        )}

        {/* Quick Reply Templates */}
        {showTemplates && (
          <div className="p-4 border-t bg-slate-50">
            <QuickReplyTemplates 
              templates={templates}
              onSelect={handleTemplateSelect}
              onCancel={() => setShowTemplates(false)}
            />
          </div>
        )}

        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className="p-4 border-t bg-amber-50">
            <div className="flex items-center space-x-2 mb-2">
              <Paperclip className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-800">
                {selectedFiles.length} file(s) selected
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedFiles.map((file, index) => (
                <div 
                  key={index}
                  className="flex items-center space-x-2 bg-white px-3 py-2 rounded-md border border-amber-200"
                >
                  {file.type.startsWith('image/') ? (
                    <Image className="h-4 w-4 text-blue-500" />
                  ) : (
                    <FileText className="h-4 w-4 text-gray-500" />
                  )}
                  <span className="text-sm truncate max-w-32">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="h-auto p-1 text-red-500 hover:text-red-700"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message Input Area */}
        <div className="p-4 border-t bg-white">
          {/* Priority Selector */}
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-sm text-muted-foreground">Priority:</span>
            {(['normal', 'low', 'high', 'urgent'] as const).map((level) => (
              <Button
                key={level}
                variant={priority === level ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPriority(level)}
                className={cn(
                  "text-xs h-6",
                  priority === level && getPriorityColor(level)
                )}
              >
                {getPriorityIcon(level)}
                <span className="ml-1 capitalize">{level}</span>
              </Button>
            ))}
          </div>

          {/* Message Input */}
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <Textarea
                ref={textareaRef}
                placeholder="Type your message..."
                value={message}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyPress={handleKeyPress}
                rows={3}
                className="resize-none"
                disabled={sending || uploading}
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col space-y-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFileUpload(!showFileUpload)}
                disabled={sending || uploading}
                title="Attach files"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTemplates(!showTemplates)}
                disabled={sending || uploading}
                title="Quick replies"
              >
                <Clock className="h-4 w-4" />
              </Button>
              
              <Button
                onClick={handleSend}
                disabled={(!message.trim() && selectedFiles.length === 0) || sending || uploading}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {sending || uploading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          {/* Upload Progress */}
          {uploading && (
            <div className="mt-2 text-sm text-blue-600 flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Uploading files...</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}