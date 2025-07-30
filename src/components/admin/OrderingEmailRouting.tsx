import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Edit, Plus, Mail, Shield, Eye, Activity, Users, Settings } from 'lucide-react';
import { EmailRoutingHealth } from './EmailRoutingHealth';
import {
  getOrderingEmailRecipients,
  createOrderingEmailRecipient,
  updateOrderingEmailRecipient,
  deleteOrderingEmailRecipient,
  getOrderingEmailLogs,
  type OrderingEmailRecipient,
  type OrderingEmailLog,
  type CreateOrderingEmailRecipient
} from '@/services/orderingEmailService';

interface AddRecipientFormProps {
  onSuccess: () => void;
  editingRecipient?: OrderingEmailRecipient | null;
  onCancel: () => void;
}

function AddRecipientForm({ onSuccess, editingRecipient, onCancel }: AddRecipientFormProps) {
  const [formData, setFormData] = useState<CreateOrderingEmailRecipient>({
    store_number: '',
    store_name: '',
    recipient_email: '',
    role: 'store_manager',
    email_type: 'order_confirmation',
    is_active: true,
    created_by: 'roderickdemarais@aol.com'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (editingRecipient) {
      setFormData({
        store_number: editingRecipient.store_number,
        store_name: editingRecipient.store_name || '',
        recipient_email: editingRecipient.recipient_email,
        role: editingRecipient.role,
        email_type: editingRecipient.email_type,
        is_active: editingRecipient.is_active,
        created_by: editingRecipient.created_by || 'roderickdemarais@aol.com'
      });
    }
  }, [editingRecipient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingRecipient) {
        await updateOrderingEmailRecipient(editingRecipient.id, formData);
        toast({
          title: "Email recipient updated",
          description: "The email recipient has been successfully updated.",
        });
      } else {
        await createOrderingEmailRecipient(formData);
        toast({
          title: "Email recipient added",
          description: "The new email recipient has been successfully added.",
        });
      }
      
      onSuccess();
      onCancel();
      
      // Reset form if adding new
      if (!editingRecipient) {
        setFormData({
          store_number: '',
          store_name: '',
          recipient_email: '',
          role: 'store_manager',
          email_type: 'order_confirmation',
          is_active: true,
          created_by: 'roderickdemarais@aol.com'
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingRecipient ? 'update' : 'add'} email recipient.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="store_number">Store Number*</Label>
          <Input
            id="store_number"
            value={formData.store_number}
            onChange={(e) => setFormData(prev => ({ ...prev, store_number: e.target.value }))}
            placeholder="e.g., 27"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="store_name">Store Name</Label>
          <Input
            id="store_name"
            value={formData.store_name}
            onChange={(e) => setFormData(prev => ({ ...prev, store_name: e.target.value }))}
            placeholder="e.g., Grand Prairie 027"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="recipient_email">Recipient Email*</Label>
        <Input
          id="recipient_email"
          type="email"
          value={formData.recipient_email}
          onChange={(e) => setFormData(prev => ({ ...prev, recipient_email: e.target.value }))}
          placeholder="manager@store.com"
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="store_manager">Store Manager</SelectItem>
              <SelectItem value="assistant_manager">Assistant Manager</SelectItem>
              <SelectItem value="warehouse_staff">Warehouse Staff</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="is_active">Status</Label>
          <Select value={formData.is_active ? "true" : "false"} onValueChange={(value) => setFormData(prev => ({ ...prev, is_active: value === "true" }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : editingRecipient ? 'Update' : 'Add'} Recipient
        </Button>
      </div>
    </form>
  );
}

export function OrderingEmailRouting() {
  const [recipients, setRecipients] = useState<OrderingEmailRecipient[]>([]);
  const [logs, setLogs] = useState<OrderingEmailLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecipient, setEditingRecipient] = useState<OrderingEmailRecipient | null>(null);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [recipientsData, logsData] = await Promise.all([
        getOrderingEmailRecipients(),
        getOrderingEmailLogs()
      ]);
      setRecipients(recipientsData);
      setLogs(logsData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load email routing data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this email recipient?')) return;
    
    try {
      await deleteOrderingEmailRecipient(id);
      toast({
        title: "Email recipient deleted",
        description: "The email recipient has been successfully deleted.",
      });
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete email recipient.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (recipient: OrderingEmailRecipient) => {
    setEditingRecipient(recipient);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingRecipient(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading email routing configuration...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Mail className="h-8 w-8" />
            Email Routing Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive email routing configuration and monitoring for all order types
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Shield className="h-3 w-3" />
          Super Admin Only
        </Badge>
      </div>

      <Tabs defaultValue="health" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="health" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            System Health
          </TabsTrigger>
          <TabsTrigger value="recipients" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Recipients
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Activity Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-6">
          <EmailRoutingHealth />
        </TabsContent>

        <TabsContent value="recipients" className="space-y-6">
          <div className="flex justify-end mb-4">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingRecipient(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Recipient
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingRecipient ? 'Edit' : 'Add'} Email Recipient
                  </DialogTitle>
                  <DialogDescription>
                    {editingRecipient ? 'Update' : 'Add'} an email recipient for order notifications.
                  </DialogDescription>
                </DialogHeader>
                <AddRecipientForm 
                  onSuccess={loadData} 
                  editingRecipient={editingRecipient}
                  onCancel={handleDialogClose}
                />
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Email Recipients Configuration
              </CardTitle>
              <CardDescription>
                Configure email recipients for all order types: Transfer, Cross-Dock, MTO, Wheel, Warranty, and Complaints
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Store</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Notification Types</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recipients.map((recipient) => (
                    <TableRow key={recipient.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">#{recipient.store_number}</div>
                          {recipient.store_name && (
                            <div className="text-sm text-muted-foreground">{recipient.store_name}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{recipient.recipient_email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {recipient.role.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(recipient as any).notification_types?.slice(0, 3).map((type: string) => (
                            <Badge key={type} variant="outline" className="text-xs">
                              {type}
                            </Badge>
                          )) || (
                            <Badge variant="outline" className="text-xs">
                              {recipient.email_type}
                            </Badge>
                          )}
                          {(recipient as any).notification_types && (recipient as any).notification_types.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{(recipient as any).notification_types.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={recipient.is_active ? "default" : "secondary"}>
                          {recipient.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(recipient)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(recipient.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {recipients.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No email recipients configured yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Recent Email Activity
              </CardTitle>
              <CardDescription>
                Email notification logs and delivery status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No recent email activity found
                </div>
              ) : (
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div key={log.id} className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{log.email_type}</Badge>
                          <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                            {log.status}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm space-y-1">
                        <div><strong>Store:</strong> {log.store_number}</div>
                        <div><strong>Order Type:</strong> {log.order_type}</div>
                        <div><strong>Recipient:</strong> {log.recipient_email}</div>
                        {log.error_details && (
                          <div className="text-red-600"><strong>Error:</strong> {log.error_details}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}