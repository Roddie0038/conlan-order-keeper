import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import type { PlatformType, UserRole } from '@/hooks/useUserManagement';

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPlatform: PlatformType;
  onUserAdded: () => void;
}

export function AddUserDialog({ open, onOpenChange, selectedPlatform, onUserAdded }: AddUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    role: '' as UserRole,
    platform: selectedPlatform,
    plant: '',
    store: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('platform_users')
        .insert([{
          ...formData,
          status: 'active' as any,
          created_by: 'roderickdemarais@aol.com'
        }]);

      if (error) throw error;

      toast({
        title: "User Added Successfully",
        description: `${formData.full_name} has been added to ${selectedPlatform.replace('_', ' ')}.`,
      });

      // Reset form
      setFormData({
        email: '',
        full_name: '',
        role: '' as UserRole,
        platform: selectedPlatform,
        plant: '',
        store: ''
      });

      onUserAdded();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Failed to Add User",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleOptions: { value: UserRole; label: string }[] = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'plant_admin', label: 'Plant Admin' },
    { value: 'store_manager', label: 'Store Manager' },
    { value: 'warehouse_manager', label: 'Warehouse Manager' },
    { value: 'operations_manager', label: 'Operations Manager' },
    { value: 'warehouse_staff', label: 'Warehouse Staff' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Add a new user to the {selectedPlatform.replace('_', ' ')} platform.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
                placeholder="user@example.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                required
                placeholder="John Doe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select 
              value={formData.role} 
              onValueChange={(value: UserRole) => setFormData(prev => ({ ...prev, role: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plant">Plant</Label>
              <Input
                id="plant"
                value={formData.plant}
                onChange={(e) => setFormData(prev => ({ ...prev, plant: e.target.value }))}
                placeholder="Grand Prairie 97"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="store">Store</Label>
              <Input
                id="store"
                value={formData.store}
                onChange={(e) => setFormData(prev => ({ ...prev, store: e.target.value }))}
                placeholder="Store 001"
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}