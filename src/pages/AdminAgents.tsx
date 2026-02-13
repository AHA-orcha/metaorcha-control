import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Zap } from "lucide-react";
import { fetchAgents, type Agent } from "@/lib/admin-api";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const AdminAgents = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [search, setSearch] = useState("");
  const [protocolFilter, setProtocolFilter] = useState<"ALL" | "MCP" | "A2A">("ALL");
  const [testing, setTesting] = useState<string | null>(null);

  useEffect(() => {
    fetchAgents().then(setAgents);
  }, []);

  const filtered = agents.filter((a) => {
    if (protocolFilter !== "ALL" && a.protocol !== protocolFilter) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleTest = async (id: string) => {
    setTesting(id);
    // Simulate connectivity test
    await new Promise((r) => setTimeout(r, 1200));
    setTesting(null);
  };

  const statusBadge = (s: Agent["status"]) =>
    cn(
      "px-2 py-0.5 text-[10px] font-bold rounded capitalize",
      s === "active" && "bg-green-100 text-green-800",
      s === "inactive" && "bg-secondary text-muted-foreground",
      s === "error" && "bg-red-100 text-red-800"
    );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Agent Registry</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage registered agents</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search agents…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1">
          {(["ALL", "MCP", "A2A"] as const).map((p) => (
            <Button
              key={p}
              variant={protocolFilter === p ? "default" : "outline"}
              size="sm"
              onClick={() => setProtocolFilter(p)}
            >
              {p}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="protocol-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Protocol</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Capabilities</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((agent) => (
              <TableRow key={agent.id}>
                <TableCell className="font-medium">{agent.name}</TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "px-2 py-0.5 text-[10px] font-bold rounded border",
                      agent.protocol === "MCP"
                        ? "bg-purple-100 text-purple-800 border-purple-300"
                        : "bg-orange-100 text-orange-800 border-orange-300"
                    )}
                  >
                    {agent.protocol}
                  </span>
                </TableCell>
                <TableCell className="font-mono text-xs">{agent.version}</TableCell>
                <TableCell>
                  <span className={statusBadge(agent.status)}>{agent.status}</span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {agent.capabilities.map((c) => (
                      <span key={c} className="px-1.5 py-0.5 bg-secondary text-[10px] rounded font-mono">
                        {c}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={testing === agent.id}
                    onClick={() => handleTest(agent.id)}
                    className="gap-1"
                  >
                    <Zap className="w-3 h-3" />
                    {testing === agent.id ? "Testing…" : "Test"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No agents found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
};

export default AdminAgents;
