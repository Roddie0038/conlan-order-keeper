import React from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MoreHorizontal, Edit, UserCheck, UserX, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { PlatformUser } from '@/hooks/useUserManagement';

interface UserActionsDropdownProps {
  user: PlatformUser;
  onEdit: (user: PlatformUser) => void;
  onUserUpdated: () => void;
}

export function UserActionsDropdown({ user, onEdit, onUserUpdated }: UserActionsDropdownProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleStatusToggle = async () => {
    setIsLoading(true);
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    
    try {
      const { error } = await supabase
        .from('platform_users')
        .update({ 
          status: newStatus,
          updated_by: 'roderickdemarais@aol.com',
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: `User ${newStatus === 'active' ? 'Activated' : 'Deactivated'}`,
        description: `${user.full_name} has been ${newStatus === 'active' ? 'activated' : 'deactivated'}.`,
      });

      onUserUpdated();
    } catch (error: any) {
      toast({
        title: "Failed to Update User Status",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('platform_users')
        .delete()
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "User Deleted",
        description: `${user.full_name} has been permanently deleted.`,
      });

      onUserUpdated();
      setShowDeleteDialog(false);
    } catch (error: any) {
      toast({
        title: "Failed to Delete User",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => onEdit(user)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit User
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleStatusToggle} disabled={isLoading}>
            {user.status === 'active' ? (
              <>
                <UserX className="mr-2 h-4 w-4" />
                Deactivate User
              </>
            ) : (
              <>
                <UserCheck className="mr-2 h-4 w-4" />
                Activate User
              </>
            )}
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete {user.full_name}'s 
              account and remove all associated data from the {user.platform.replace('_', ' ')} platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Deleting..." : "Delete User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}