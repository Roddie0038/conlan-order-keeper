import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, Plus, MessageSquare, Users, AlertCircle } from "lucide-react";
import { RegionalMessageDialog } from "./RegionalMessageDialog";
import { RegionalMessagesList } from "./RegionalMessagesList";
import { useRegionalMessages } from "@/hooks/useRegionalMessages";
import { useAuth } from "@/contexts/AuthContext";
import { usePlant } from "@/contexts/PlantContext";

export function RegionalMessagesPage() {
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false);
  const { user } = useAuth();
  const { currentPlant } = usePlant();
  const { 
    messages, 
    unreadCount, 
    loading, 
    sending, 
    sendMessage, 
    markAsRead 
  } = useRegionalMessages();

  const handleSendMessage = async (subject: string, body: string) => {
    const success = await sendMessage(subject, body);
    if (success) {
      setShowNewMessageDialog(false);
    }
    return success;
  };

  // Check if user can send regional messages (admin/manager roles)
  const canSendMessages = user?.isAdmin || 
    user?.title?.toLowerCase().includes('manager') ||
    user?.title?.toLowerCase().includes('admin');

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Globe className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Regional Messages</CardTitle>
                  <p className="text-gray-600 mt-1">
                    Plant-wide communications for {currentPlant}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {unreadCount} unread
                  </Badge>
                )}
                {canSendMessages && (
                  <Button 
                    onClick={() => setShowNewMessageDialog(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    New Message
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{messages.length}</p>
                  <p className="text-sm text-gray-600">Total Messages</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{unreadCount}</p>
                  <p className="text-sm text-gray-600">Unread Messages</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{currentPlant}</p>
                  <p className="text-sm text-gray-600">Current Plant</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Messages List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RegionalMessagesList 
              messages={messages}
              loading={loading}
              onMarkAsRead={markAsRead}
            />
          </CardContent>
        </Card>
      </div>

      {/* New Message Dialog */}
      <RegionalMessageDialog
        open={showNewMessageDialog}
        onOpenChange={setShowNewMessageDialog}
        onSendMessage={handleSendMessage}
        sending={sending}
      />
    </div>
  );
}