const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export interface ServiceHealth {
  name: string;
  status: "healthy" | "degraded" | "down";
  latency?: number;
}

export interface DashboardMetrics {
  total_workflows: number;
  success_rate: number;
  active_agents: number;
  services: ServiceHealth[];
  recent_events: Array<{
    id: string;
    event_type: string;
    protocol?: string;
    message: string;
    timestamp: string;
  }>;
}

export interface WorkflowStats {
  total_24h: number;
  completed: number;
  failed: number;
  running: number;
  avg_execution_ms: number;
  over_time: Array<{ hour: string; count: number }>;
  protocol_distribution: { MCP: number; A2A: number };
}

export interface Agent {
  id: string;
  name: string;
  protocol: "MCP" | "A2A";
  version: string;
  status: "active" | "inactive" | "error";
  capabilities: string[];
}

// Fetch with fallback to mock data for demo
async function safeFetch<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return fallback;
  }
}

const MOCK_SERVICES: ServiceHealth[] = [
  { name: "Gateway", status: "healthy", latency: 12 },
  { name: "Registry", status: "healthy", latency: 8 },
  { name: "Runtime", status: "healthy", latency: 45 },
  { name: "Database", status: "healthy", latency: 5 },
  { name: "Kafka", status: "degraded", latency: 120 },
  { name: "Redis", status: "healthy", latency: 2 },
];

const MOCK_METRICS: DashboardMetrics = {
  total_workflows: 1284,
  success_rate: 94.7,
  active_agents: 12,
  services: MOCK_SERVICES,
  recent_events: [
    { id: "1", event_type: "LOG", protocol: "MCP", message: "Calculator agent processed add(5,3)", timestamp: new Date().toISOString() },
    { id: "2", event_type: "LOG", protocol: "A2A", message: "Number2Words agent converting 8", timestamp: new Date().toISOString() },
    { id: "3", event_type: "COMPLETED", protocol: "SYSTEM", message: "Workflow wf-abc123 completed", timestamp: new Date().toISOString() },
    { id: "4", event_type: "LOG", protocol: "MCP", message: "File reader agent initialized", timestamp: new Date().toISOString() },
    { id: "5", event_type: "ERROR", protocol: "A2A", message: "Timeout on translator agent", timestamp: new Date().toISOString() },
  ],
};

const MOCK_STATS: WorkflowStats = {
  total_24h: 342,
  completed: 318,
  failed: 14,
  running: 10,
  avg_execution_ms: 2340,
  over_time: Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    count: Math.floor(Math.random() * 30) + 5,
  })),
  protocol_distribution: { MCP: 58, A2A: 42 },
};

const MOCK_AGENTS: Agent[] = [
  { id: "a1", name: "Calculator", protocol: "MCP", version: "1.2.0", status: "active", capabilities: ["add", "subtract", "multiply", "divide"] },
  { id: "a2", name: "Number2Words", protocol: "A2A", version: "2.0.1", status: "active", capabilities: ["convert", "localize"] },
  { id: "a3", name: "FileReader", protocol: "MCP", version: "1.0.0", status: "active", capabilities: ["read", "list", "search"] },
  { id: "a4", name: "Translator", protocol: "A2A", version: "3.1.0", status: "error", capabilities: ["translate", "detect_language"] },
  { id: "a5", name: "Summarizer", protocol: "A2A", version: "1.5.2", status: "active", capabilities: ["summarize", "extract_keywords"] },
  { id: "a6", name: "CodeRunner", protocol: "MCP", version: "0.9.0", status: "inactive", capabilities: ["execute", "lint", "format"] },
];

export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  return safeFetch(`${BACKEND_URL}/admin/api/v1/dashboard/metrics`, MOCK_METRICS);
}

export async function fetchWorkflowStats(): Promise<WorkflowStats> {
  return safeFetch(`${BACKEND_URL}/admin/api/v1/workflows/stats`, MOCK_STATS);
}

export async function fetchAgents(): Promise<Agent[]> {
  return safeFetch(`${BACKEND_URL}/admin/api/v1/agents`, MOCK_AGENTS);
}
