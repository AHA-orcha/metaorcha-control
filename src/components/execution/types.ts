export interface WorkflowEvent {
  id: string;
  workflow_id: string;
  event_type: "LOG" | "COMPLETED" | "ERROR";
  protocol?: "MCP" | "A2A" | "SYSTEM";
  data?: {
    message?: string;
    result?: unknown;
    error?: string;
  };
  timestamp: string;
}
