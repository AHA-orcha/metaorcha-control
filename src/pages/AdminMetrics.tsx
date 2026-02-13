import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchWorkflowStats, type WorkflowStats } from "@/lib/admin-api";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const PIE_COLORS = ["hsl(270, 76%, 62%)", "hsl(25, 95%, 53%)"];

const AdminMetrics = () => {
  const [stats, setStats] = useState<WorkflowStats | null>(null);

  useEffect(() => {
    fetchWorkflowStats().then(setStats);
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <p className="text-muted-foreground font-mono text-sm">Loading metrics…</p>
      </div>
    );
  }

  const pieData = [
    { name: "MCP", value: stats.protocol_distribution.MCP },
    { name: "A2A", value: stats.protocol_distribution.A2A },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Metrics</h1>
        <p className="text-muted-foreground text-sm mt-1">Last 24 hours</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total_24h, color: "text-foreground" },
          { label: "Completed", value: stats.completed, color: "text-protocol-green" },
          { label: "Failed", value: stats.failed, color: "text-protocol-red" },
          { label: "Running", value: stats.running, color: "text-primary" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="protocol-card p-5"
          >
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Avg execution */}
      <div className="protocol-card p-5 inline-block">
        <p className="text-xs text-muted-foreground">Avg Execution Time</p>
        <p className="text-xl font-bold font-mono">{(stats.avg_execution_ms / 1000).toFixed(2)}s</p>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="protocol-card p-6">
          <h3 className="text-sm font-semibold mb-4">Workflows Over Time</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={stats.over_time}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240,6%,90%)" />
              <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="hsl(239,84%,67%)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="protocol-card p-6">
          <h3 className="text-sm font-semibold mb-4">Protocol Distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminMetrics;
