import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Bot, CheckCircle, AlertTriangle, XCircle, TrendingUp } from "lucide-react";
import { fetchDashboardMetrics, type DashboardMetrics } from "@/lib/admin-api";
import { cn } from "@/lib/utils";

const statusIcon = (s: string) => {
  if (s === "healthy") return <CheckCircle className="w-4 h-4 text-protocol-green" />;
  if (s === "degraded") return <AlertTriangle className="w-4 h-4 text-protocol-yellow" />;
  return <XCircle className="w-4 h-4 text-protocol-red" />;
};

const statusDot = (s: string) =>
  cn(
    "w-2.5 h-2.5 rounded-full",
    s === "healthy" && "bg-protocol-green",
    s === "degraded" && "bg-protocol-yellow",
    s === "down" && "bg-protocol-red"
  );

const AdminDashboard = () => {
  const [data, setData] = useState<DashboardMetrics | null>(null);

  useEffect(() => {
    fetchDashboardMetrics().then(setData);
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <p className="text-muted-foreground font-mono text-sm">Loading dashboard…</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">System health & key metrics</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Workflows", value: data.total_workflows.toLocaleString(), icon: TrendingUp },
          { label: "Success Rate", value: `${data.success_rate}%`, icon: CheckCircle },
          { label: "Active Agents", value: data.active_agents, icon: Bot },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="protocol-card p-6 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <kpi.icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{kpi.value}</p>
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Service Health */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Service Health</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {data.services.map((svc) => (
            <div key={svc.name} className="protocol-card p-4 flex flex-col items-center gap-2 text-center">
              {statusIcon(svc.status)}
              <span className="text-sm font-medium">{svc.name}</span>
              <div className="flex items-center gap-1.5">
                <div className={statusDot(svc.status)} />
                <span className="text-xs text-muted-foreground capitalize">{svc.status}</span>
              </div>
              {svc.latency !== undefined && (
                <span className="text-[10px] font-mono text-muted-foreground">{svc.latency}ms</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Recent Events */}
      <section>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4" /> Recent Events
        </h2>
        <div className="protocol-card divide-y divide-border overflow-hidden">
          {data.recent_events.map((evt) => (
            <div key={evt.id} className="px-4 py-3 flex items-center gap-3 text-sm">
              <span
                className={cn(
                  "px-2 py-0.5 text-[10px] font-bold rounded border",
                  evt.protocol === "MCP" && "bg-purple-100 text-purple-800 border-purple-300",
                  evt.protocol === "A2A" && "bg-orange-100 text-orange-800 border-orange-300",
                  evt.protocol === "SYSTEM" && "bg-blue-100 text-blue-800 border-blue-300"
                )}
              >
                {evt.protocol}
              </span>
              <span
                className={cn(
                  "px-1.5 py-0.5 text-[10px] font-mono rounded",
                  evt.event_type === "COMPLETED" && "bg-green-100 text-green-800",
                  evt.event_type === "ERROR" && "bg-red-100 text-red-800",
                  evt.event_type === "LOG" && "bg-secondary text-muted-foreground"
                )}
              >
                {evt.event_type}
              </span>
              <span className="flex-1 truncate">{evt.message}</span>
              <span className="text-xs text-muted-foreground font-mono">
                {new Date(evt.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
