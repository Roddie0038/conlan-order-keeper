
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MessageWarehouseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderNumber: string;
  storeName: string;
  onSendMessage: (message: string) => Promise<boolean>;
  sending: boolean;
}

export function MessageWarehouseDialog({
  open,
  onOpenChange,
  orderNumber,
  storeName,
  onSendMessage,
  sending
}: MessageWarehouseDialogProps) {
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const handleSend = async () => {
    if (!message.trim()) {
      toast({
        title: "Message Required",
        description: "Please enter a message before sending.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      console.log("🔍 MessageWarehouseDialog - Attempting to send message:", {
        orderNumber,
        storeName,
        messageLength: message.length,
        timestamp: new Date().toISOString()
      });
      
      const success = await onSendMessage(message);
      
      if (success) {
        console.log("✅ MessageWarehouseDialog - Message sent successfully");
        setMessage("");
        onOpenChange(false);
        toast({
          title: "Message Sent",
          description: "Your message has been delivered successfully.",
        });
      } else {
        console.error("❌ MessageWarehouseDialog - Message send returned false");
        toast({
          title: "Message Failed",
          description: "Failed to send message. Please check your permissions and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("❌ MessageWarehouseDialog - Message send threw error:", {
        error,
        orderNumber,
        storeName,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      
      // Provide more specific error messaging
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      const isPermissionError = errorMessage.includes('permission') || 
                               errorMessage.includes('Access denied') ||
                               errorMessage.includes('row-level security');
      
      toast({
        title: "Message Failed",
        description: isPermissionError 
          ? "Access denied. Please verify your store permissions for this order."
          : "Failed to send message. Please try again or contact support.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setMessage("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Message Warehouse
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-600">Order Number</Label>
              <div className="mt-1 p-2 bg-gray-50 rounded-md border">
                <span className="font-medium">{orderNumber}</span>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Store</Label>
              <div className="mt-1 p-2 bg-gray-50 rounded-md border">
                <span className="font-medium">{storeName}</span>
              </div>
            </div>
          </div>
          
          <div>
            <Label htmlFor="message" className="text-sm font-medium text-gray-700">
              Message to Warehouse
            </Label>
            <Textarea
              id="message"
              placeholder="Type your message to the warehouse..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="mt-1"
              disabled={sending}
              maxLength={1000}
            />
            <div className="text-xs text-gray-500 mt-1">
              {message.length}/1000 characters
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-end space-x-2">
          <Button variant="ghost" onClick={handleClose} disabled={sending}>
            Cancel
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={!message.trim() || sending}
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            {sending ? "Sending..." : "Send Message"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
