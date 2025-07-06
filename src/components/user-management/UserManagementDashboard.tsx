import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, Download, Filter, Plus, RefreshCw, Users } from 'lucide-react';
import { useUserManagement } from '@/hooks/useUserManagement';
import { useUserActivityLogs } from '@/hooks/useUserActivityLogs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ErrorBoundary } from '@/components/ui/error-boundary';

export function UserManagementDashboard() {
  const [selectedPlatform, setSelectedPlatform] = useState<'ordering_platform' | 'ot_platform'>('ordering_platform');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStore, setFilterStore] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { users, loading: usersLoading, error: usersError, refetch: refetchUsers } = useUserManagement(selectedPlatform);
  const { logs, loading: logsLoading, error: logsError, refetch: refetchLogs } = useUserActivityLogs(selectedPlatform);

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStore = filterStore === 'all' || user.store === filterStore;
    
    return matchesSearch && matchesRole && matchesStore;
  });

  const exportToCSV = () => {
    const csvData = filteredUsers.map(user => ({
      'Full Name': user.full_name,
      'Email': user.email,
      'Role': user.role,
      'Platform': user.platform,
      'Status': user.status,
      'Store': user.store || '',
      'Plant': user.plant || '',
      'Created': new Date(user.created_at).toLocaleDateString(),
      'Last Login': user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_${selectedPlatform}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      suspended: 'destructive'
    } as const;
    
    return <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>{status}</Badge>;
  };

  return (
    <ErrorBoundary context="User Management Dashboard" onError={(error) => {
      console.error('[UserManagementDashboard] Dashboard error:', error);
    }}>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground">Manage users across both platforms</p>
          </div>
          
          {/* Platform Switcher */}
          <div className="flex items-center gap-4">
            <Select value={selectedPlatform} onValueChange={(value: 'ordering_platform' | 'ot_platform') => setSelectedPlatform(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ordering_platform">Ordering Platform</SelectItem>
                <SelectItem value="ot_platform">OT Platform</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={() => { refetchUsers(); refetchLogs(); }} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Error Alerts */}
        {(usersError || logsError) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {usersError || logsError}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users ({filteredUsers.length})
            </TabsTrigger>
            <TabsTrigger value="activity">Activity Logs ({logs.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Platform Users</CardTitle>
                    <CardDescription>
                      Manage users for {selectedPlatform.replace('_', ' ')}
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button onClick={exportToCSV} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add User
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Filters */}
                <div className="flex items-center gap-4 flex-wrap">
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                  
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterStore} onValueChange={setFilterStore}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by store" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Stores</SelectItem>
                      {Array.from(new Set(users.map(u => u.store).filter(Boolean))).map(store => (
                        <SelectItem key={store} value={store!}>{store}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Users Table */}
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Store</TableHead>
                        <TableHead>Plant</TableHead>
                        <TableHead>Last Active</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersLoading ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            Loading users...
                          </TableCell>
                        </TableRow>
                      ) : filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            No users found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.full_name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{user.role}</Badge>
                            </TableCell>
                            <TableCell>{getStatusBadge(user.status)}</TableCell>
                            <TableCell>{user.store || '-'}</TableCell>
                            <TableCell>{user.plant || '-'}</TableCell>
                            <TableCell>
                              {user.last_login ? formatTimestamp(user.last_login) : 'Never'}
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">Edit</Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Activity Logs</CardTitle>
                <CardDescription>
                  Recent user activity for {selectedPlatform.replace('_', ' ')}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Performed By</TableHead>
                        <TableHead>Affected User</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logsLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            Loading activity logs...
                          </TableCell>
                        </TableRow>
                      ) : logs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No activity logs found
                          </TableCell>
                        </TableRow>
                      ) : (
                        logs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>{formatTimestamp(log.timestamp)}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{log.action}</Badge>
                            </TableCell>
                            <TableCell>{log.performed_by}</TableCell>
                            <TableCell>{log.affected_user}</TableCell>
                            <TableCell>{log.description || '-'}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </ErrorBoundary>
  );
}