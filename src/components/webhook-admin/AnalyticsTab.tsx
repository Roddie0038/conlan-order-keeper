import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Analytics {
  date: string;
  webhook_type: string;
  total_deliveries: number;
  successful_deliveries: number;
  failed_deliveries: number;
  avg_duration_ms: number;
}

export function AnalyticsTab() {
  const [analytics, setAnalytics] = useState<Analytics[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("webhook_deliveries" as any)
        .select(
          `
          webhook_type,
          success,
          duration_ms,
          created_at
        `
        )
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Aggregate analytics by date and type
      const aggregated = (data as any[]).reduce((acc: Record<string, Analytics>, row: any) => {
        const date = format(new Date(row.created_at), "yyyy-MM-dd");
        const key = `${date}-${row.webhook_type}`;

        if (!acc[key]) {
          acc[key] = {
            date,
            webhook_type: row.webhook_type,
            total_deliveries: 0,
            successful_deliveries: 0,
            failed_deliveries: 0,
            avg_duration_ms: 0,
          };
        }

        acc[key].total_deliveries++;
        if (row.success) {
          acc[key].successful_deliveries++;
        } else {
          acc[key].failed_deliveries++;
        }
        acc[key].avg_duration_ms += row.duration_ms;

        return acc;
      }, {});

      const analyticsArray = Object.values(aggregated).map((item: Analytics) => ({
        ...item,
        avg_duration_ms: Math.round(item.avg_duration_ms / item.total_deliveries),
      }));

      setAnalytics(analyticsArray);
    } catch (error: any) {
      toast({
        title: "Error loading analytics",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const totalDeliveries = analytics.reduce((sum, a) => sum + a.total_deliveries, 0);
  const successfulDeliveries = analytics.reduce((sum, a) => sum + a.successful_deliveries, 0);
  const failedDeliveries = analytics.reduce((sum, a) => sum + a.failed_deliveries, 0);
  const successRate = totalDeliveries > 0 ? (successfulDeliveries / totalDeliveries) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDeliveries}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{successfulDeliveries}</div>
            <p className="text-xs text-muted-foreground">{successRate.toFixed(1)}% success rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{failedDeliveries}</div>
            <p className="text-xs text-muted-foreground">
              {(100 - successRate).toFixed(1)}% failure rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.length > 0
                ? Math.round(
                    analytics.reduce((sum, a) => sum + a.avg_duration_ms, 0) / analytics.length
                  )
                : 0}
              ms
            </div>
            <p className="text-xs text-muted-foreground">Average response time</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analytics.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">
                    {item.webhook_type} - {format(new Date(item.date), "MMM dd, yyyy")}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {item.total_deliveries} deliveries • {item.avg_duration_ms}ms avg
                  </div>
                </div>
                <div className="flex gap-4 text-sm">
                  <span className="text-green-600">✓ {item.successful_deliveries}</span>
                  <span className="text-red-600">✗ {item.failed_deliveries}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
