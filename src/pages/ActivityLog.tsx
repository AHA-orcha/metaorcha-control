import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Activity, Bot, User, Settings, FileText, Clock } from "lucide-react";
import { format } from "date-fns";

interface ActivityLog {
  id: string;
  user_id: string;
  action_type: string;
  entity_type: string;
  entity_id: string | null;
  metadata: unknown;
  created_at: string;
}

const actionTypeConfig: Record<string, { label: string; color: string }> = {
  create: { label: "Created", color: "bg-green-500/10 text-green-500 border-green-500/20" },
  update: { label: "Updated", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  delete: { label: "Deleted", color: "bg-red-500/10 text-red-500 border-red-500/20" },
  execute: { label: "Executed", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  login: { label: "Login", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  logout: { label: "Logout", color: "bg-gray-500/10 text-gray-500 border-gray-500/20" },
};

const entityTypeConfig: Record<string, { icon: React.ElementType; label: string }> = {
  agent: { icon: Bot, label: "Agent" },
  user: { icon: User, label: "User" },
  manifest: { icon: FileText, label: "Manifest" },
  system: { icon: Settings, label: "System" },
  workflow: { icon: Activity, label: "Workflow" },
};

const ActivityLog = () => {
  const { role } = useAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchLogs();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('activity_logs_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_logs',
        },
        (payload) => {
          setLogs((prev) => [payload.new as ActivityLog, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = filter === "all" 
    ? logs 
    : logs.filter(log => log.action_type === filter);

  const getActionBadge = (actionType: string) => {
    const config = actionTypeConfig[actionType] || { 
      label: actionType, 
      color: "bg-muted text-muted-foreground" 
    };
    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getEntityIcon = (entityType: string) => {
    const config = entityTypeConfig[entityType] || { 
      icon: Activity, 
      label: entityType 
    };
    const Icon = config.icon;
    return <Icon className="h-4 w-4 text-muted-foreground" />;
  };

  const formatMetadata = (metadata: unknown) => {
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return null;
    
    const entries = Object.entries(metadata as Record<string, unknown>).slice(0, 2);
    return entries.map(([key, value]) => (
      <span key={key} className="text-xs text-muted-foreground">
        {key}: {String(value)}
      </span>
    ));
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 ml-16 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                <Activity className="h-6 w-6" />
                Activity Log
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {role === 'admin' ? 'All system activity' : 'Your recent activity'}
              </p>
            </div>

            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="create">Created</SelectItem>
                <SelectItem value="update">Updated</SelectItem>
                <SelectItem value="delete">Deleted</SelectItem>
                <SelectItem value="execute">Executed</SelectItem>
                <SelectItem value="login">Login</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Activity Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Recent Activity ({filteredLogs.length} events)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground" />
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No activity logs found</p>
                  <p className="text-sm mt-1">Activity will appear here as you use the platform</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[140px]">Timestamp</TableHead>
                      <TableHead className="w-[100px]">Action</TableHead>
                      <TableHead className="w-[120px]">Entity</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3" />
                            {format(new Date(log.created_at), 'MMM d, HH:mm:ss')}
                          </div>
                        </TableCell>
                        <TableCell>{getActionBadge(log.action_type)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getEntityIcon(log.entity_type)}
                            <span className="text-sm capitalize">{log.entity_type}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            {log.entity_id && (
                              <span className="font-mono text-xs text-muted-foreground">
                                ID: {log.entity_id.slice(0, 8)}...
                              </span>
                            )}
                            {formatMetadata(log.metadata)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ActivityLog;
