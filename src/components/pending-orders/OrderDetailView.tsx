
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { File, Info, CheckCircle, XCircle, Send, RefreshCw, Hourglass } from "lucide-react";

interface OrderDetailViewProps {
  order: any;
  onClose: () => void;
}

export function OrderDetailView({ order, onClose }: OrderDetailViewProps) {
  const [outOfStock, setOutOfStock] = useState(false);
  const [showOutOfStockDialog, setShowOutOfStockDialog] = useState(false);
  const [messageRecipient, setMessageRecipient] = useState("store-manager");
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const handleOutOfStockConfirm = () => {
    setOutOfStock(true);
    setShowOutOfStockDialog(false);
    toast({
      title: "Order marked as Out of Stock",
      description: "A notification has been prepared for sending to the store.",
    });
  };

  const handleMarkReadyToFulfill = () => {
    setOutOfStock(false);
    toast({
      title: "Order marked as Ready to Fulfill",
      description: "This order has been moved back to the active queue.",
    });
  };

  const handleSendMessage = () => {
    if (!message.trim()) {
      toast({
        title: "Message cannot be empty",
        description: "Please enter a message before sending.",
        variant: "destructive",
      });
      return;
    }

    const recipientType = messageRecipient === "store-manager" ? "Store Manager" : "Order Submitter";
    
    toast({
      title: "Message Sent",
      description: `Your message has been sent to the ${recipientType}.`,
    });
    
    setMessage("");
  };

  const generateDocument = (documentType: string) => {
    toast({
      title: `${documentType} Generated`,
      description: "The document has been prepared and is ready for download.",
    });
  };

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader className="bg-slate-50 border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold">
            Order #{order.id} - {order.store}
          </CardTitle>
          <div className="flex items-center space-x-2">
            {outOfStock ? (
              <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                <Hourglass className="h-3 w-3 mr-1" />
                Out of Stock
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                <RefreshCw className="h-3 w-3 mr-1" />
                Synced to Supabase
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <XCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <Tabs defaultValue="details">
          <TabsList className="mb-4">
            <TabsTrigger value="details">Order Details</TabsTrigger>
            <TabsTrigger value="message">Send Message</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-slate-500">Store Information</h4>
                  <p className="font-medium">{order.store}</p>
                  <p className="text-sm text-slate-600">{order.storeManager}</p>
                  <p className="text-sm text-slate-600">{order.email}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-slate-500">Order Date</h4>
                  <p>{new Date(order.timestamp).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-slate-500">Product Information</h4>
                  <p className="font-medium">{order.productNumber}</p>
                  <p className="text-sm">{order.description}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-slate-500">Quantity</h4>
                  <p>{order.quantity}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-slate-500">Schedule Arrival</h4>
                  <p>{order.scheduleArrival}</p>
                </div>
              </div>
            </div>
            
            {order.notes && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-slate-500">Notes</h4>
                <p className="text-sm bg-slate-50 p-3 rounded-md border">{order.notes}</p>
              </div>
            )}
            
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-lg font-medium mb-4">Document Actions</h3>
              <div className="flex flex-wrap gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => generateDocument("Pull Sheet")}
                  className="flex items-center gap-2"
                >
                  <File className="h-4 w-4" />
                  Pull Sheet
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => generateDocument("Completion Sheet")}
                  className="flex items-center gap-2"
                >
                  <File className="h-4 w-4" />
                  Completion Sheet
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => generateDocument("Cross-Dock Sheet")}
                  className="flex items-center gap-2"
                >
                  <File className="h-4 w-4" />
                  Cross-Dock Sheet
                </Button>
                
                {outOfStock ? (
                  <Button 
                    variant="outline" 
                    className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700"
                    onClick={handleMarkReadyToFulfill}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Ready to Fulfill
                  </Button>
                ) : (
                  <Dialog open={showOutOfStockDialog} onOpenChange={setShowOutOfStockDialog}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 hover:text-amber-700"
                      >
                        <File className="h-4 w-4 mr-2" />
                        Out-of-Stock Sheet
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirm Out of Stock</DialogTitle>
                      </DialogHeader>
                      <p className="text-slate-600">
                        Are you sure you want to mark this order as Out of Stock? 
                        This will notify the store and flag the order for priority fulfillment once inventory is available.
                      </p>
                      <DialogFooter className="flex justify-end space-x-2 mt-4">
                        <Button variant="ghost" onClick={() => setShowOutOfStockDialog(false)}>Cancel</Button>
                        <Button variant="default" onClick={handleOutOfStockConfirm}>Confirm</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="message" className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Send To:</label>
                <Select value={messageRecipient} onValueChange={setMessageRecipient}>
                  <SelectTrigger className="w-full md:w-[250px]">
                    <SelectValue placeholder="Select recipient" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="store-manager">Store Manager</SelectItem>
                    <SelectItem value="order-submitter">Order Submitter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Message:</label>
                <Textarea 
                  placeholder="Enter your message here..." 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  className="w-full"
                />
              </div>
              
              <Button 
                onClick={handleSendMessage}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Send Message
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
