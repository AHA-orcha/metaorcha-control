import { motion } from "framer-motion";
import { Check, Circle, Loader2 } from "lucide-react";

export interface TimelineStep {
  id: string;
  label: string;
  status: "pending" | "active" | "complete";
  agent?: string;
}

interface ExecutionTimelineProps {
  steps: TimelineStep[];
}

export const ExecutionTimeline = ({ steps }: ExecutionTimelineProps) => {
  return (
    <div className="protocol-card p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-sm uppercase tracking-wider">Execution State</h3>
        <span className="text-xs font-mono text-muted-foreground">
          {steps.filter(s => s.status === "complete").length}/{steps.length}
        </span>
      </div>

      <div className="space-y-1">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            {/* Connecting line */}
            {index < steps.length - 1 && (
              <div className="absolute left-[9px] top-6 w-[2px] h-6 bg-border" />
            )}
            
            <div className="flex items-start gap-3 py-2">
              {/* Status indicator */}
              <div className="mt-0.5">
                {step.status === "complete" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-5 h-5 rounded-full bg-protocol-green flex items-center justify-center"
                  >
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </motion.div>
                )}
                {step.status === "active" && (
                  <div className="relative w-5 h-5 flex items-center justify-center">
                    <div className="absolute w-5 h-5 rounded-full bg-protocol-blue/20 animate-ping" />
                    <div className="w-3 h-3 rounded-full bg-protocol-blue" />
                  </div>
                )}
                {step.status === "pending" && (
                  <Circle className="w-5 h-5 text-muted-foreground/30" strokeWidth={1.5} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${
                  step.status === "pending" ? "text-muted-foreground" :
                  step.status === "complete" ? "text-muted-foreground line-through" :
                  "text-foreground"
                }`}>
                  {step.label}
                </p>
                {step.agent && step.status === "active" && (
                  <p className="text-xs font-mono text-protocol-blue mt-0.5">
                    {step.agent}
                  </p>
                )}
              </div>

              {/* Active indicator */}
              {step.status === "active" && (
                <Loader2 className="w-4 h-4 text-protocol-blue animate-spin" />
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
