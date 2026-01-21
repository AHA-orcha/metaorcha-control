import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface LogEntry {
  id: string;
  timestamp: string;
  source: string;
  message: string;
  level: "info" | "success" | "warning" | "error";
}

interface ConsoleStreamProps {
  logs: LogEntry[];
}

const levelColors = {
  info: "text-console-fg",
  success: "text-protocol-green",
  warning: "text-protocol-yellow",
  error: "text-protocol-red",
};

const sourceColors: Record<string, string> = {
  MCP: "text-protocol-blue",
  A2A: "text-purple-400",
  SYS: "text-console-muted",
  AGT: "text-emerald-400",
};

export const ConsoleStream = ({ logs }: ConsoleStreamProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="protocol-card h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-protocol-green" />
          <h3 className="font-bold text-sm uppercase tracking-wider">Console</h3>
        </div>
        <span className="text-xs font-mono text-muted-foreground">
          {logs.length} entries
        </span>
      </div>

      {/* Console */}
      <div 
        ref={scrollRef}
        className="flex-1 console-container p-4 overflow-y-auto font-mono text-sm"
      >
        <AnimatePresence mode="popLayout">
          {logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex gap-2 py-1 hover:bg-white/5 px-2 -mx-2 rounded"
            >
              <span className="text-console-muted shrink-0">{log.timestamp}</span>
              <span className={`shrink-0 ${sourceColors[log.source] || 'text-console-muted'}`}>
                [{log.source}]
              </span>
              <span className={levelColors[log.level]}>
                {log.message}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Cursor */}
        <motion.div
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="inline-block w-2 h-4 bg-console-fg mt-2"
        />
      </div>
    </div>
  );
};
