import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  created: string;
  lastUsed: string | null;
  active: boolean;
}

const INITIAL_KEYS: ApiKey[] = [
  { id: "1", name: "Production", prefix: "mo_prod_****7f3b", created: "2025-01-15", lastUsed: "2025-02-12", active: true },
  { id: "2", name: "Development", prefix: "mo_dev_****a2c1", created: "2025-02-01", lastUsed: "2025-02-13", active: true },
  { id: "3", name: "CI/CD Pipeline", prefix: "mo_ci_****d8e4", created: "2024-12-10", lastUsed: null, active: false },
];

const AdminApiKeys = () => {
  const [keys, setKeys] = useState<ApiKey[]>(INITIAL_KEYS);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const handleCreate = () => {
    if (!newName.trim()) return;
    const key: ApiKey = {
      id: crypto.randomUUID(),
      name: newName,
      prefix: `mo_${newName.slice(0, 3).toLowerCase()}_****${Math.random().toString(36).slice(2, 6)}`,
      created: new Date().toISOString().slice(0, 10),
      lastUsed: null,
      active: true,
    };
    setKeys((prev) => [key, ...prev]);
    setNewName("");
    setShowCreate(false);
  };

  const handleRevoke = (id: string) => {
    setKeys((prev) => prev.map((k) => (k.id === id ? { ...k, active: false } : k)));
  };

  const toggleReveal = (id: string) => {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage access credentials</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)} className="gap-1.5">
          <Plus className="w-4 h-4" /> New Key
        </Button>
      </div>

      {showCreate && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="protocol-card p-5 flex gap-3"
        >
          <Input
            placeholder="Key name (e.g. Production)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            className="max-w-xs"
            autoFocus
          />
          <Button onClick={handleCreate} disabled={!newName.trim()}>Create</Button>
          <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="protocol-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Key</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Used</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keys.map((k) => (
              <TableRow key={k.id}>
                <TableCell className="font-medium">{k.name}</TableCell>
                <TableCell className="font-mono text-xs">
                  {revealed.has(k.id) ? k.prefix.replace("****", "abcd") : k.prefix}
                </TableCell>
                <TableCell className="text-xs">{k.created}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{k.lastUsed ?? "Never"}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                      k.active ? "bg-green-100 text-green-800" : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {k.active ? "Active" : "Revoked"}
                  </span>
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button size="sm" variant="ghost" onClick={() => toggleReveal(k.id)} aria-label="Toggle reveal">
                    {revealed.has(k.id) ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </Button>
                  {k.active && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRevoke(k.id)}
                      className="text-destructive hover:text-destructive"
                      aria-label="Revoke key"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
};

export default AdminApiKeys;
