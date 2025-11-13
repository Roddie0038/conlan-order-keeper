import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, FileText, Package, Wrench, Shield, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function RightPanel() {
  const navigate = useNavigate();

  const quickActions = [
    { icon: FileText, label: "New MTO", path: "/mto-request" },
    { icon: Package, label: "New Transfer", path: "/transfer-request" },
    { icon: Wrench, label: "Wheel Order", path: "/powder-coat-request" },
    { icon: Shield, label: "Warranty", path: "/warranty-submission" },
  ];

  const recentActivity = [
    { icon: "Tri", label: "Trewet submissions", time: "4m ago", subtime: "4h ago" },
    { icon: "Wa", label: "Warranty submission", time: "4m ago", subtime: "4h ago" },
    { icon: "📋", label: "Approved tread List", time: "24 ago", subtime: "3d ago" },
  ];

  return (
    <aside className="w-80 space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.path}
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-3"
                onClick={() => navigate(action.path)}
              >
                <div className="p-1.5 rounded-md bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <span className="flex-1 text-left">{action.label}</span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </Button>
            );
          })}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentActivity.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-sm font-medium">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.label}</p>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span>{item.time}</span>
                    <span>{item.subtime}</span>
                  </div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-lg bg-accent hover:bg-accent/80 cursor-pointer transition-colors">
            <p className="text-sm font-medium">Adelnin Dashboard</p>
            <p className="text-xs text-muted-foreground mt-1">View latest updates</p>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
