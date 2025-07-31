/**
 * Phase 7: Recipient Action Logs Audit Dashboard
 * Super Admin interface to view all recipient management actions
 * Supports filtering, search, and CSV export for compliance
 */

import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  Download, 
  Search, 
  Calendar, 
  User, 
  Mail, 
  Activity,
  Eye,
  UserPlus,
  UserX,
  RotateCcw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

interface RecipientActionLog {
  id: string;
  action_type: string;
  email_type: string;
  recipient_email: string;
  recipient_name: string | null;
  recipient_role: string | null;
  store_number: string;
  plant: string | null;
  template_id: string | null;
  order_id: string | null;
  performed_by_email: string;
  performed_by_name: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
}

interface AuditFilters {
  action_type: string;
  email_type: string;
  store_number: string;
  performed_by: string;
  date_from: string;
  date_to: string;
  search: string;
}

export const RecipientAuditDashboard: React.FC = () => {
  const [logs, setLogs] = useState<RecipientActionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AuditFilters>({
    action_type: '',
    email_type: '',
    store_number: '',
    performed_by: '',
    date_from: '',
    date_to: '',
    search: ''
  });

  // Load logs from database
  const loadLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('recipient_action_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      // Apply filters
      if (filters.action_type) {
        query = query.eq('action_type', filters.action_type);
      }
      if (filters.email_type) {
        query = query.eq('email_type', filters.email_type);
      }
      if (filters.store_number) {
        query = query.eq('store_number', filters.store_number);
      }
      if (filters.performed_by) {
        query = query.ilike('performed_by_email', `%${filters.performed_by}%`);
      }
      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from);
      }
      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to);
      }
      if (filters.search) {
        query = query.or(`recipient_email.ilike.%${filters.search}%,recipient_name.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading logs:', error);
        return;
      }

      setLogs(data || []);
    } catch (error) {
      console.error('Error in loadLogs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [filters]);

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      'Timestamp',
      'Action',
      'Email Type',
      'Recipient Email',
      'Recipient Name',
      'Role',
      'Store',
      'Plant',
      'Performed By',
      'Template ID',
      'Order ID'
    ];

    const rows = logs.map(log => [
      new Date(log.created_at).toLocaleString(),
      log.action_type,
      log.email_type,
      log.recipient_email,
      log.recipient_name || '',
      log.recipient_role,
      log.store_number,
      log.plant || '',
      `${log.performed_by_name} (${log.performed_by_email})`,
      log.template_id || '',
      log.order_id || ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `recipient_audit_log_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'add': return <UserPlus className="h-4 w-4 text-green-600" />;
      case 'remove': return <UserX className="h-4 w-4 text-red-600" />;
      case 'reset': return <RotateCcw className="h-4 w-4 text-blue-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'add': return <Badge variant="default" className="bg-green-100 text-green-800">Add</Badge>;
      case 'remove': return <Badge variant="destructive" className="bg-red-100 text-red-800">Remove</Badge>;
      case 'reset': return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Reset</Badge>;
      default: return <Badge variant="outline">{action}</Badge>;
    }
  };

  const getEmailTypeBadge = (emailType: string) => {
    const colors = {
      transfer: 'bg-purple-100 text-purple-800',
      mto: 'bg-orange-100 text-orange-800',
      wheel: 'bg-teal-100 text-teal-800',
      warranty: 'bg-yellow-100 text-yellow-800'
    };
    return (
      <Badge variant="outline" className={colors[emailType as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {emailType.toUpperCase()}
      </Badge>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-blue-600" />
            <CardTitle>Recipient Action Audit Dashboard</CardTitle>
          </div>
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search emails/names..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10"
            />
          </div>

          <Select value={filters.action_type} onValueChange={(value) => setFilters(prev => ({ ...prev, action_type: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Action Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Actions</SelectItem>
              <SelectItem value="add">Add</SelectItem>
              <SelectItem value="remove">Remove</SelectItem>
              <SelectItem value="reset">Reset</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.email_type} onValueChange={(value) => setFilters(prev => ({ ...prev, email_type: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Email Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
              <SelectItem value="mto">MTO</SelectItem>
              <SelectItem value="wheel">Wheel</SelectItem>
              <SelectItem value="warranty">Warranty</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Store Number"
            value={filters.store_number}
            onChange={(e) => setFilters(prev => ({ ...prev, store_number: e.target.value }))}
          />

          <Input
            type="date"
            placeholder="From Date"
            value={filters.date_from}
            onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value }))}
          />

          <Input
            type="date"
            placeholder="To Date"
            value={filters.date_to}
            onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value }))}
          />
        </div>

        {/* Clear Filters */}
        {Object.values(filters).some(f => f) && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setFilters({
              action_type: '',
              email_type: '',
              store_number: '',
              performed_by: '',
              date_from: '',
              date_to: '',
              search: ''
            })}
          >
            <Filter className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        )}

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{logs.length} action{logs.length !== 1 ? 's' : ''} found</span>
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>

        {/* Results Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-900">Timestamp</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900">Action</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900">Type</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900">Recipient</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900">Store</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900">Performed By</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900">Context</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      Loading audit logs...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      No audit logs found matching your criteria
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium">
                              {new Date(log.created_at).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(log.created_at).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          {getActionIcon(log.action_type)}
                          {getActionBadge(log.action_type)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {getEmailTypeBadge(log.email_type)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium">{log.recipient_name || 'Unknown Name'}</div>
                            <div className="text-xs text-gray-500">{log.recipient_email}</div>
                            <div className="text-xs text-gray-400">{log.recipient_role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium">{log.store_number}</div>
                          {log.plant && (
                            <div className="text-xs text-gray-500">{log.plant}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium">{log.performed_by_name}</div>
                            <div className="text-xs text-gray-500">{log.performed_by_email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs space-y-1">
                          {log.template_id && (
                            <div className="text-blue-600">Template: {log.template_id}</div>
                          )}
                          {log.order_id && (
                            <div className="text-green-600">Order: {log.order_id}</div>
                          )}
                          {!log.template_id && !log.order_id && (
                            <div className="text-gray-400">Global action</div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};