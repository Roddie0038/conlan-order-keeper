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
import { Trash2, Edit, Plus, Mail, Shield, Eye } from 'lucide-react';
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
            <Shield className="h-8 w-8 text-red-600" />
            Order Confirmation Email Routing
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage email recipients for order confirmation notifications (Super Admin Only)
          </p>
        </div>
        
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
                {editingRecipient ? 'Update' : 'Add'} an email recipient for order confirmation notifications.
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

      <Tabs defaultValue="recipients" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recipients">Email Recipients</TabsTrigger>
          <TabsTrigger value="logs">Delivery Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recipients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Recipients
              </CardTitle>
              <CardDescription>
                Configure who receives order confirmation emails for each store.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Store</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
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
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No email recipients configured yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Delivery Logs
              </CardTitle>
              <CardDescription>
                View recent order confirmation email delivery logs and status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Store</TableHead>
                    <TableHead>Order Type</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {new Date(log.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>#{log.store_number}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {log.order_type}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.recipient_email}</TableCell>
                      <TableCell>
                        <Badge variant={log.status === 'success' ? "default" : "destructive"}>
                          {log.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {logs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No delivery logs available yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}