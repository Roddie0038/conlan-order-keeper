
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Activity } from "lucide-react";

interface EmailLog {
  id: number;
  timestamp: string;
  emailType: string;
  routeStatus: string;
  recipientEmail: string;
  renderedSubject: string;
  renderedBody: string;
}

interface EmailDebugLogProps {
  logs: EmailLog[];
}

export function EmailDebugLog({ logs }: EmailDebugLogProps) {
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    return status === "Success" ? (
      <Badge className="bg-green-100 text-green-800">Success</Badge>
    ) : (
      <Badge variant="destructive">Failed</Badge>
    );
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Email Debug Logs
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline">
              {logs.length} Total Emails
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No email logs yet. Send a test email to see logs here.</p>
          </div>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Email Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Subject</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs">
                      {formatTimestamp(log.timestamp)}
                    </TableCell>
                    <TableCell>{log.emailType}</TableCell>
                    <TableCell>{getStatusBadge(log.routeStatus)}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {log.recipientEmail}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {log.renderedSubject}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-700">
            📝 Debug logs are automatically cleared daily to prevent cluttering. 
            All emails during testing are routed only to admin users.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
