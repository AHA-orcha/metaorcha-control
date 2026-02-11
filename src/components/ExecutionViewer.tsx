import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, AlertCircle, Loader2 } from "lucide-react";

export interface WorkflowEvent {
  id: string;
  type: "LOG" | "COMPLETED" | "ERROR";
  protocol?: string;
  message: string;
  timestamp: string;
  result?: unknown;
}

interface ExecutionViewerProps {
  prompt: string;
  onBack: () => void;
}

const protocolBadge: Record<string, { bg: string; text: string; border: string }> = {
  MCP: { bg: "bg-protocol-purple/10", text: "text-protocol-purple", border: "border-protocol-purple/20" },
  A2A: { bg: "bg-protocol-orange/10", text: "text-protocol-orange", border: "border-protocol-orange/20" },
  SYSTEM: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" },
};

const eventBorder: Record<string, string> = {
  LOG: "border-l-4 border-l-primary/50 bg-secondary/40",
  COMPLETED: "border-l-4 border-l-protocol-green bg-protocol-green/5",
  ERROR: "border-l-4 border-l-destructive bg-destructive/5",
};

export const ExecutionViewer = ({ prompt, onBack }: ExecutionViewerProps) => {
  const [events, setEvents] = useState<WorkflowEvent[]>([]);
  const [status, setStatus] = useState<"running" | "completed" | "error">("running");
  const [workflowId, setWorkflowId] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const addEvent = useCallback((evt: WorkflowEvent) => {
    setEvents((prev) => [...prev, evt]);
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  // SSE connection
  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      try {
        const resp = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/orchestrate`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({ prompt }),
            signal: controller.signal,
          }
        );

        if (!resp.ok || !resp.body) {
          const errText = await resp.text();
          let errMsg = "Workflow submission failed";
          try {
            errMsg = JSON.parse(errText).error || errMsg;
          } catch {}
          addEvent({
            id: crypto.randomUUID(),
            type: "ERROR",
            protocol: "SYSTEM",
            message: errMsg,
            timestamp: new Date().toISOString(),
          });
          setStatus("error");
          return;
        }

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let nlIdx: number;
          while ((nlIdx = buffer.indexOf("\n")) !== -1) {
            const line = buffer.slice(0, nlIdx).trim();
            buffer = buffer.slice(nlIdx + 1);

            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") break;

            try {
              const parsed = JSON.parse(jsonStr);
              const evt: WorkflowEvent = {
                id: crypto.randomUUID(),
                type: parsed.type || "LOG",
                protocol: parsed.protocol,
                message: parsed.message || "",
                timestamp: parsed.timestamp || new Date().toISOString(),
                result: parsed.result,
              };

              if (parsed.workflow_id && !workflowId) {
                setWorkflowId(parsed.workflow_id);
              }

              addEvent(evt);

              if (evt.type === "COMPLETED") setStatus("completed");
              if (evt.type === "ERROR") setStatus("error");
            } catch {}
          }
        }

        // If still running after stream ends without explicit completion
        setStatus((prev) => (prev === "running" ? "completed" : prev));
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        addEvent({
          id: crypto.randomUUID(),
          type: "ERROR",
          protocol: "SYSTEM",
          message: err instanceof Error ? err.message : "Connection failed",
          timestamp: new Date().toISOString(),
        });
        setStatus("error");
      }
    };

    run();
    return () => controller.abort();
  }, [prompt, addEvent]);

  const formatTime = (ts: string) => {
    try {
      return new Date(ts).toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <div className="hero-gradient min-h-[calc(100vh-3.5rem)] flex flex-col items-center px-6 py-8 -m-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-secondary rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Workflow Execution</h2>
            {workflowId && (
              <p className="text-sm font-mono text-muted-foreground">
                {workflowId}
              </p>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          {status === "running" && (
            <>
              <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">Running...</span>
            </>
          )}
          {status === "completed" && (
            <>
              <div className="w-5 h-5 rounded-full bg-protocol-green flex items-center justify-center">
                <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
              </div>
              <span className="text-sm font-medium text-protocol-green">Completed</span>
            </>
          )}
          {status === "error" && (
            <>
              <AlertCircle className="w-5 h-5 text-destructive" />
              <span className="text-sm font-medium text-destructive">Failed</span>
            </>
          )}
        </div>
      </motion.div>

      {/* Event Stream */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="protocol-card w-full max-w-3xl overflow-hidden"
      >
        <div
          ref={scrollRef}
          className="max-h-96 overflow-y-auto p-4 space-y-3"
        >
          <AnimatePresence mode="popLayout">
            {events.length === 0 && status === "running" && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 text-muted-foreground flex flex-col items-center gap-2"
              >
                <Loader2 className="w-5 h-5 animate-spin" />
                Waiting for workflow events...
              </motion.div>
            )}

            {events.map((evt) => (
              <motion.div
                key={evt.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className={`rounded-lg p-4 ${eventBorder[evt.type] || "bg-secondary/30"}`}
              >
                <div className="flex items-start gap-3">
                  {/* Protocol Badge */}
                  {evt.protocol && protocolBadge[evt.protocol] && (
                    <span
                      className={`px-2 py-1 text-xs font-bold rounded border shrink-0 ${protocolBadge[evt.protocol].bg} ${protocolBadge[evt.protocol].text} ${protocolBadge[evt.protocol].border}`}
                    >
                      {evt.protocol}
                    </span>
                  )}

                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-foreground text-sm">
                      {evt.type}
                    </span>
                    <p className="text-sm text-muted-foreground mt-0.5">{evt.message}</p>

                    {/* Final Result */}
                    {evt.type === "COMPLETED" && evt.result && (
                      <div className="border-t border-border pt-3 mt-3">
                        <p className="text-sm font-semibold text-protocol-green">
                          🎉 Final Result:
                        </p>
                        <pre className="text-lg font-bold text-foreground mt-1 whitespace-pre-wrap font-mono">
                          {typeof evt.result === "object"
                            ? JSON.stringify(evt.result, null, 2)
                            : String(evt.result)}
                        </pre>
                      </div>
                    )}
                  </div>

                  {/* Timestamp */}
                  <span className="text-xs text-muted-foreground shrink-0 font-mono">
                    {formatTime(evt.timestamp)}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Protocol Legend */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-6 bg-card rounded-full shadow-md px-6 py-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-bold rounded border bg-protocol-purple/10 text-protocol-purple border-protocol-purple/20">
              MCP
            </span>
            <span className="text-xs text-muted-foreground font-mono">stdio/JSON-RPC</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-bold rounded border bg-protocol-orange/10 text-protocol-orange border-protocol-orange/20">
              A2A
            </span>
            <span className="text-xs text-muted-foreground font-mono">HTTP/REST API</span>
          </div>
        </div>
      </div>
    </div>
  );
};
