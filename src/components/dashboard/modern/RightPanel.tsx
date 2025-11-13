import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, FileText, Package, Wrench, Shield, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

export function RightPanel() {
  const navigate = useNavigate();

  const quickActions = [
    { icon: FileText, label: "New MTO", path: ROUTES.mtoRequest },
    { icon: Package, label: "New Transfer", path: ROUTES.transferRequest },
    { icon: Wrench, label: "Wheel Order", path: ROUTES.wheelPowderCoat },
    { icon: Shield, label: "Warranty", path: ROUTES.warrantySubmission },
  ];

  const recentActivity = [
    { icon: "Tri", label: "Trewet submissions", time: "4m ago", subtime: "4h ago" },
    { icon: "Wa", label: "Warranty submission", time: "4m ago", subtime: "4h ago" },
    { icon: "📋", label: "Approved tread List", time: "24 ago", subtime: "3d ago" },
  ];

  return (
    <aside className="w-80 space-y-6">
      {/* Quick Actions */}
      <Card className="bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-xl shadow-black/50">
        <CardHeader>
          <CardTitle className="text-lg text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.path}
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-3 bg-slate-800/40 border-white/10 hover:bg-slate-800/60 hover:border-white/20 text-white group transition-all"
                onClick={() => navigate(action.path)}
              >
                <div className="p-1.5 rounded-md bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-600/30">
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <span className="flex-1 text-left">{action.label}</span>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
              </Button>
            );
          })}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-xl shadow-black/50">
        <CardHeader>
          <CardTitle className="text-lg text-white">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentActivity.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 cursor-pointer transition-all group border border-white/5 hover:border-white/10"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-8 h-8 rounded-md bg-slate-700/50 flex items-center justify-center text-sm font-medium text-white border border-white/10">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-white">{item.label}</p>
                  <div className="flex gap-2 text-xs text-slate-400">
                    <span>{item.time}</span>
                    <span>{item.subtime}</span>
                  </div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:text-blue-400 transition-all" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-xl shadow-black/50">
        <CardHeader>
          <CardTitle className="text-lg text-white">Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-lg bg-gradient-to-br from-blue-900/40 to-blue-800/30 hover:from-blue-900/50 hover:to-blue-800/40 cursor-pointer transition-all border border-white/10 hover:border-blue-400/30 shadow-lg shadow-blue-900/20">
            <p className="text-sm font-medium text-white">Admin Dashboard</p>
            <p className="text-xs text-slate-300 mt-1">View latest updates</p>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
