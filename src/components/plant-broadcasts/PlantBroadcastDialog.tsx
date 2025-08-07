import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send, Globe } from "lucide-react";
import { usePlant } from "@/contexts/PlantContext";

interface PlantBroadcastDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSendMessage: (subject: string, body: string) => Promise<boolean>;
  sending: boolean;
}

export function PlantBroadcastDialog({
  open,
  onOpenChange,
  onSendMessage,
  sending
}: PlantBroadcastDialogProps) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const { currentPlant } = usePlant();

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) return;
    
    const success = await onSendMessage(subject, body);
    if (success) {
      setSubject("");
      setBody("");
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setSubject("");
    setBody("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Send Plant Broadcast
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-600">Target Plant</Label>
            <div className="mt-1 p-3 bg-blue-50 rounded-md border border-blue-200">
              <span className="font-medium text-blue-900">{currentPlant}</span>
              <p className="text-sm text-blue-700 mt-1">
                This message will be sent to all users in this plant
              </p>
            </div>
          </div>
          
          <div>
            <Label htmlFor="subject" className="text-sm font-medium text-gray-700">
              Subject <span className="text-red-500">*</span>
            </Label>
            <Input
              id="subject"
              placeholder="Enter message subject..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1"
              disabled={sending}
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">
              {subject.length}/200 characters
            </p>
          </div>
          
          <div>
            <Label htmlFor="body" className="text-sm font-medium text-gray-700">
              Message <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="body"
              placeholder="Type your plant broadcast here..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              className="mt-1"
              disabled={sending}
              maxLength={2000}
            />
            <p className="text-xs text-gray-500 mt-1">
              {body.length}/2000 characters
            </p>
          </div>
        </div>

        <DialogFooter className="flex justify-end space-x-2">
          <Button variant="ghost" onClick={handleClose} disabled={sending}>
            Cancel
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={!subject.trim() || !body.trim() || sending}
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            {sending ? "Sending..." : "Send Plant Broadcast"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}