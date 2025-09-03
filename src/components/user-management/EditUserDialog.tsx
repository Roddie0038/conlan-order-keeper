import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { getGeneralRoleOptions } from '@/constants/roles';
import type { PlatformUser, UserRole, UserStatus } from '@/hooks/useUserManagement';

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: PlatformUser | null;
  onUserUpdated: () => void;
}

export function EditUserDialog({ open, onOpenChange, user, onUserUpdated }: EditUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    role: '' as UserRole,
    status: '' as UserStatus,
    plant: '',
    store: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        status: user.status,
        plant: user.plant || '',
        store: user.store || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('platform_users')
        .update({
          ...formData,
          updated_by: 'roderickdemarais@aol.com',
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "User Updated Successfully",
        description: `${formData.full_name}'s profile has been updated.`,
      });

      onUserUpdated();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Failed to Update User",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Use canonical roles for general user management (excludes office_manager)
  const roleOptions = getGeneralRoleOptions();

  const statusOptions: { value: UserStatus; label: string }[] = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'pending', label: 'Pending' }
  ];

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] backdrop-blur-xl bg-slate-800/40 border-slate-700/50 rounded-2xl shadow-xl transition-all duration-300">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-semibold text-white">Edit User</DialogTitle>
          <DialogDescription className="text-slate-300">
            Update user information for {user.full_name}.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-200">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
                className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-sm font-medium text-slate-200">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                required
                className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium text-slate-200">Role *</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value: UserRole) => setFormData(prev => ({ ...prev, role: value }))}
                required
              >
                <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white hover:bg-slate-800/50 focus:border-blue-500 focus:ring-blue-500/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600 backdrop-blur-xl">
                  {roleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-white hover:bg-slate-700 focus:bg-slate-700">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium text-slate-200">Status *</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: UserStatus) => setFormData(prev => ({ ...prev, status: value }))}
                required
              >
                <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white hover:bg-slate-800/50 focus:border-blue-500 focus:ring-blue-500/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600 backdrop-blur-xl">
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-white hover:bg-slate-700 focus:bg-slate-700">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plant" className="text-sm font-medium text-slate-200">Plant</Label>
              <Input
                id="plant"
                value={formData.plant}
                onChange={(e) => setFormData(prev => ({ ...prev, plant: e.target.value }))}
                placeholder="Grand Prairie 097"
                className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="store" className="text-sm font-medium text-slate-200">Store</Label>
              <Input
                id="store"
                value={formData.store}
                onChange={(e) => setFormData(prev => ({ ...prev, store: e.target.value }))}
                placeholder="Store 001"
                className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-3 pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-600/50 hover:text-white transition-all duration-200"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}