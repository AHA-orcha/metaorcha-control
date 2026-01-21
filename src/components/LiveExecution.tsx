import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Square } from "lucide-react";
import { ExecutionTimeline, TimelineStep } from "./ExecutionTimeline";
import { ConsoleStream, LogEntry } from "./ConsoleStream";
import { InterruptModal } from "./InterruptModal";

interface LiveExecutionProps {
  prompt: string;
  onBack: () => void;
}

const initialSteps: TimelineStep[] = [
  { id: "1", label: "Initialize orchestration context", status: "pending" },
  { id: "2", label: "Analyze directive & decompose tasks", status: "pending" },
  { id: "3", label: "Select optimal agent configuration", status: "pending" },
  { id: "4", label: "Establish MCP connections", status: "pending" },
  { id: "5", label: "Execute primary workflow", status: "pending", agent: "PriceOracle-01" },
  { id: "6", label: "Aggregate results & synthesize", status: "pending" },
  { id: "7", label: "Finalize & archive execution", status: "pending" },
];

type LogLevel = "info" | "success" | "warning" | "error";

const mockLogMessages: { source: string; message: string; level: LogLevel }[] = [
  { source: "SYS", message: "Initializing MetaOrcha v0.1.0...", level: "info" },
  { source: "SYS", message: "Loading orchestration context", level: "info" },
  { source: "MCP", message: "Connecting to localhost:3000/mcp", level: "info" },
  { source: "MCP", message: "Handshake complete. Protocol v2.1", level: "success" },
  { source: "A2A", message: "Registering with discovery service...", level: "info" },
  { source: "A2A", message: "12 agents available in swarm", level: "success" },
  { source: "SYS", message: "Decomposing directive into subtasks", level: "info" },
  { source: "AGT", message: "TaskPlanner-01 assigned to decomposition", level: "info" },
  { source: "AGT", message: "Generated 4 subtasks from directive", level: "success" },
  { source: "SYS", message: "Selecting agents for task execution", level: "info" },
  { source: "A2A", message: "Agent selection complete: 3 agents assigned", level: "success" },
  { source: "MCP", message: "Opening tool channels...", level: "info" },
  { source: "MCP", message: "Tool: search_web → Ready", level: "success" },
  { source: "MCP", message: "Tool: read_file → Ready", level: "success" },
  { source: "MCP", message: "Tool: execute_code → Ready", level: "success" },
  { source: "AGT", message: "PriceOracle-01 starting execution", level: "info" },
  { source: "AGT", message: "Requesting wallet access...", level: "warning" },
];

export const LiveExecution = ({ prompt, onBack }: LiveExecutionProps) => {
  const [steps, setSteps] = useState<TimelineStep[]>(initialSteps);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [logIndex, setLogIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const addLog = useCallback((logData: { source: string; message: string; level: LogLevel }) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
    
    setLogs(prev => [...prev, {
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp,
      ...logData,
    }]);
  }, []);

  // Simulate log streaming
  useEffect(() => {
    if (isPaused || logIndex >= mockLogMessages.length) return;

    const timer = setTimeout(() => {
      addLog(mockLogMessages[logIndex]);
      setLogIndex(prev => prev + 1);

      // Trigger interrupt modal at specific point
      if (logIndex === mockLogMessages.length - 1) {
        setIsPaused(true);
        setTimeout(() => setShowModal(true), 500);
      }
    }, 300 + Math.random() * 400);

    return () => clearTimeout(timer);
  }, [logIndex, isPaused, addLog]);

  // Simulate step progression
  useEffect(() => {
    if (isPaused || currentStep >= steps.length) return;

    const progressMap = [0, 2, 4, 8, 12, 15, 17];
    
    if (logIndex >= (progressMap[currentStep + 1] || 999)) {
      setSteps(prev => prev.map((step, idx) => ({
        ...step,
        status: idx < currentStep ? "complete" : idx === currentStep ? "active" : "pending"
      })));
      setCurrentStep(prev => prev + 1);
    }
  }, [logIndex, currentStep, isPaused, steps.length]);

  const handleApprove = () => {
    setShowModal(false);
    setIsPaused(false);
    addLog({ source: "SYS", message: "Authorization granted. Resuming execution.", level: "success" });
  };

  const handleReject = () => {
    setShowModal(false);
    addLog({ source: "SYS", message: "Authorization denied. Execution halted.", level: "error" });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-secondary rounded-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-protocol-blue animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Live Execution
              </span>
            </div>
            <h2 className="font-bold text-lg truncate max-w-md">{prompt}</h2>
          </div>
        </div>

        <button
          onClick={() => setIsPaused(!isPaused)}
          className="inline-flex items-center gap-2 px-4 py-2 border border-destructive text-destructive rounded-sm hover:bg-destructive hover:text-destructive-foreground transition-colors font-medium text-sm"
        >
          <Square className="w-3 h-3" />
          Halt Execution
        </button>
      </motion.div>

      {/* Execution Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="h-full"
        >
          <ExecutionTimeline steps={steps} />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="h-full min-h-[400px]"
        >
          <ConsoleStream logs={logs} />
        </motion.div>
      </div>

      {/* Interrupt Modal */}
      <InterruptModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onApprove={handleApprove}
        onReject={handleReject}
        agent="PriceOracle-01"
        action="Access wallet for price data aggregation"
      />
    </div>
  );
};
