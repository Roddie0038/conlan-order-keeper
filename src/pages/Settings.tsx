import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, MessageSquare, Building, Warehouse, CheckCircle, Paperclip, Mail, ArrowRightLeft } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { NotificationPreferences } from '@/components/settings/NotificationPreferences';

const Settings = () => {
  const [viewMode, setViewMode] = useState<'store' | 'warehouse'>('store');
  const navigate = useNavigate();

  const downloadPDF = () => {
    // Placeholder for PDF download functionality
    console.log('Download PDF clicked');
  };

  const openPlantSwitcherGuide = () => {
    navigate('/plant-switcher-guide');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your preferences and access training materials
          </p>
        </div>

        <Tabs defaultValue="training" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="training">Training</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="training" className="space-y-6">
            {/* Plant Switcher Guide Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ArrowRightLeft className="h-6 w-6 text-primary" />
                  <CardTitle>Plant Switcher Training Guide</CardTitle>
                </div>
                <CardDescription>
                  Complete guide on how to switch plants in the ordering system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h4 className="font-medium mb-2">📚 What You'll Learn</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• How to locate and use the Plant Switcher</li>
                    <li>• Understanding plant coverage areas</li>
                    <li>• Step-by-step switching instructions</li>
                    <li>• Best practices and troubleshooting</li>
                  </ul>
                </div>
                <div className="flex justify-center">
                  <Button onClick={openPlantSwitcherGuide} className="gap-2" size="lg">
                    <ArrowRightLeft className="h-4 w-4" />
                    📖 Open Plant Switcher Guide
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-6 w-6 text-primary" />
                  <CardTitle>How to Use Order Messaging Between the Ordering Platform and OT Platform</CardTitle>
                </div>
                <CardDescription>
                  Complete guide on using the messaging system for order communication
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Role-based toggle */}
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      <Label htmlFor="view-mode">Store Manager View</Label>
                    </div>
                    <Switch
                      id="view-mode"
                      checked={viewMode === 'warehouse'}
                      onCheckedChange={(checked) => setViewMode(checked ? 'warehouse' : 'store')}
                    />
                    <div className="flex items-center gap-2">
                      <Warehouse className="h-5 w-5" />
                      <Label htmlFor="view-mode">Warehouse View</Label>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {viewMode === 'store' ? '🏪 Store View' : '🏭 Warehouse View'}
                  </Badge>
                </div>

                {/* PDF Download */}
                <div className="flex justify-center">
                  <Button onClick={downloadPDF} className="gap-2">
                    <Download className="h-4 w-4" />
                    📄 Download Complete Guide (PDF)
                  </Button>
                </div>

                {/* Training Content */}
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="overview">
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Overview: Order Messaging System
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <p className="text-muted-foreground">
                        The Order Messaging System enables seamless communication between the Ordering Platform and OT Platform for order-related discussions, updates, and file sharing.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                          <h4 className="font-medium mb-2">📨 Key Features</h4>
                          <ul className="text-sm space-y-1 text-muted-foreground">
                            <li>• Real-time messaging</li>
                            <li>• File attachments</li>
                            <li>• Read receipts</li>
                            <li>• Quick reply templates</li>
                          </ul>
                        </div>
                        <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                          <h4 className="font-medium mb-2">✅ Benefits</h4>
                          <ul className="text-sm space-y-1 text-muted-foreground">
                            <li>• Faster order resolution</li>
                            <li>• Centralized communication</li>
                            <li>• Order context preservation</li>
                            <li>• Audit trail maintenance</li>
                          </ul>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {viewMode === 'store' ? (
                    <>
                      <AccordionItem value="starting-messages">
                        <AccordionTrigger className="text-left">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-blue-500" />
                            🏪 Store Manager: How to Start Messages
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4">
                          <div className="space-y-3">
                            <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/20">
                              <h4 className="font-medium mb-2">Step 1: Access Order Messages</h4>
                              <p className="text-sm text-muted-foreground">
                                Navigate to your order details page and look for the "Messages" tab or chat icon.
                              </p>
                            </div>
                            <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/20">
                              <h4 className="font-medium mb-2">Step 2: Compose Your Message</h4>
                              <p className="text-sm text-muted-foreground">
                                Click "New Message" or the compose button. Type your message in the text area.
                              </p>
                            </div>
                            <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/20">
                              <h4 className="font-medium mb-2">Step 3: Add Attachments (Optional)</h4>
                              <p className="text-sm text-muted-foreground">
                                📎 Click the attachment icon to upload files, images, or documents related to your order.
                              </p>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="store-best-practices">
                        <AccordionTrigger className="text-left">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            🏪 Store Best Practices
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4">
                          <div className="grid grid-cols-1 gap-4">
                            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                              <h4 className="font-medium mb-2 text-green-700 dark:text-green-300">✅ Do This</h4>
                              <ul className="text-sm space-y-1 text-muted-foreground">
                                <li>• Be specific about your order requirements</li>
                                <li>• Include order numbers and relevant details</li>
                                <li>• Attach supporting documents when needed</li>
                                <li>• Use quick reply templates for common requests</li>
                              </ul>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </>
                  ) : (
                    <>
                      <AccordionItem value="warehouse-receiving">
                        <AccordionTrigger className="text-left">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-orange-500" />
                            🏭 Warehouse: Receiving & Responding to Messages
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4">
                          <div className="space-y-3">
                            <div className="p-4 border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-950/20">
                              <h4 className="font-medium mb-2">Step 1: Message Notifications</h4>
                              <p className="text-sm text-muted-foreground">
                                You'll receive notifications when new messages arrive. Check the message indicator for unread messages.
                              </p>
                            </div>
                            <div className="p-4 border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-950/20">
                              <h4 className="font-medium mb-2">Step 2: View Message Context</h4>
                              <p className="text-sm text-muted-foreground">
                                Messages are linked to specific orders, so you'll see all relevant order details alongside the conversation.
                              </p>
                            </div>
                            <div className="p-4 border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-950/20">
                              <h4 className="font-medium mb-2">Step 3: Respond Promptly</h4>
                              <p className="text-sm text-muted-foreground">
                                Use the reply function to respond. Your responses will be delivered to the store manager automatically.
                              </p>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="warehouse-best-practices">
                        <AccordionTrigger className="text-left">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            🏭 Warehouse Best Practices
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4">
                          <div className="grid grid-cols-1 gap-4">
                            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                              <h4 className="font-medium mb-2 text-green-700 dark:text-green-300">✅ Response Guidelines</h4>
                              <ul className="text-sm space-y-1 text-muted-foreground">
                                <li>• Acknowledge receipt of urgent messages</li>
                                <li>• Provide estimated timelines when possible</li>
                                <li>• Share status updates proactively</li>
                                <li>• Use templates for standard responses</li>
                              </ul>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </>
                  )}

                  <AccordionItem value="features">
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center gap-2">
                        <Paperclip className="h-4 w-4 text-purple-500" />
                        📎 Advanced Features
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                          <h4 className="font-medium mb-2">File Attachments</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Share documents, images, and files up to 50MB.
                          </p>
                          <ul className="text-xs space-y-1 text-muted-foreground">
                            <li>• Supported: PDF, Excel, Images, Text files</li>
                            <li>• Drag & drop or click to upload</li>
                            <li>• Automatic virus scanning</li>
                          </ul>
                        </div>
                        <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                          <h4 className="font-medium mb-2">Quick Reply Templates</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Use pre-written responses for common scenarios.
                          </p>
                          <ul className="text-xs space-y-1 text-muted-foreground">
                            <li>• Order confirmations</li>
                            <li>• Status updates</li>
                            <li>• Common questions</li>
                          </ul>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="troubleshooting">
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-red-500" />
                        🔧 Troubleshooting
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-950/20">
                          <h4 className="font-medium mb-2">Messages Not Sending</h4>
                          <ul className="text-sm space-y-1 text-muted-foreground">
                            <li>• Check your internet connection</li>
                            <li>• Refresh the page and try again</li>
                            <li>• Ensure file attachments are under 50MB</li>
                          </ul>
                        </div>
                        <div className="p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-950/20">
                          <h4 className="font-medium mb-2">Not Receiving Notifications</h4>
                          <ul className="text-sm space-y-1 text-muted-foreground">
                            <li>• Check your browser notification settings</li>
                            <li>• Verify your email notification preferences</li>
                            <li>• Contact IT support if issues persist</li>
                          </ul>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <NotificationPreferences />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;