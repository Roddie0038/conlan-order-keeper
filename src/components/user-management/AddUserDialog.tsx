import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { getGeneralRoleOptions } from '@/constants/roles';
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

  // Use canonical roles for general user management (excludes office_manager)
  const roleOptions = getGeneralRoleOptions();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] backdrop-blur-xl bg-slate-800/40 border-slate-700/50 rounded-2xl shadow-xl transition-all duration-300">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-semibold text-white">Add New User</DialogTitle>
          <DialogDescription className="text-slate-300">
            Add a new user to the {selectedPlatform.replace('_', ' ')} platform.
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
                placeholder="user@example.com"
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
                placeholder="John Doe"
                className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-medium text-slate-200">Role *</Label>
            <Select 
              value={formData.role} 
              onValueChange={(value: UserRole) => setFormData(prev => ({ ...prev, role: value }))}
              required
            >
              <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white hover:bg-slate-800/50 focus:border-blue-500 focus:ring-blue-500/20">
                <SelectValue placeholder="Select a role" className="text-slate-400" />
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
              Add User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}