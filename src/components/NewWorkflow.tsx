import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Info, Zap, Network, Loader2, AlertCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NewWorkflowProps {
  onInitialize: (prompt: string) => void;
}

const exampleQueries = [
  "Calculate 5+3 and convert to words",
  "Multiply 8 times 4 and show as text",
  "Divide 20 by 4 then convert result",
];

export const NewWorkflow = ({ onInitialize }: NewWorkflowProps) => {
  const [prompt, setPrompt] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isSubmitting) return;
    setError(null);
    onInitialize(prompt);
  };

  return (
    <div className="hero-gradient min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-6 -m-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center mb-10 max-w-3xl"
      >
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
          <span className="gradient-text">MetaOrcha</span>
        </h1>
        <p className="text-xl font-semibold text-foreground/80 mb-2">
          Protocol-Agnostic Multi-Agent Orchestration
        </p>
        <p className="text-muted-foreground">
          Watch AI agents with different protocols collaborate seamlessly in real-time
        </p>

        {/* Protocol Badges */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-protocol-purple/10 text-protocol-purple border border-protocol-purple/20 cursor-default">
                <Zap className="w-3 h-3" />
                MCP
                <Info className="w-3 h-3 opacity-60" />
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs text-xs">
              <strong>Model Context Protocol</strong> — Communicates via stdio/JSON-RPC for local tool execution and context sharing.
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-protocol-orange/10 text-protocol-orange border border-protocol-orange/20 cursor-default">
                <Network className="w-3 h-3" />
                A2A
                <Info className="w-3 h-3 opacity-60" />
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs text-xs">
              <strong>Agent-to-Agent Protocol</strong> — Communicates via HTTP/REST for distributed agent collaboration across networks.
            </TooltipContent>
          </Tooltip>
        </div>
      </motion.div>

      {/* Workflow Submission Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
        className="protocol-card w-full max-w-2xl p-8"
      >
        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-semibold text-foreground mb-2">
            What would you like the agents to do?
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            rows={4}
            placeholder={`e.g. "Calculate 5+3 and convert the result to words"\ne.g. "Multiply 6 by 7 then convert to English"`}
            className={`w-full rounded-xl px-4 py-3 text-sm resize-none outline-none bg-card transition-all duration-200 border-2 ${
              isFocused
                ? "border-primary ring-2 ring-primary/30 border-transparent"
                : "border-border"
            } placeholder:text-muted-foreground/50`}
          />

          {/* Example Queries */}
          <div className="mt-3">
            <span className="text-sm text-muted-foreground">Try these examples:</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {exampleQueries.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setPrompt(q)}
                  className="px-4 py-2 text-sm rounded-full bg-secondary hover:bg-secondary/70 text-foreground/80 transition-colors cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Execute Button */}
          <motion.button
            type="submit"
            disabled={!prompt.trim() || isSubmitting}
            whileHover={prompt.trim() && !isSubmitting ? { y: -2 } : {}}
            whileTap={prompt.trim() && !isSubmitting ? { scale: 0.98 } : {}}
            className={`w-full mt-6 py-4 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
              !prompt.trim() || isSubmitting
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg hover:shadow-xl"
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Executing Workflow...
              </>
            ) : (
              <>
                Execute Workflow
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>

          {/* Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 rounded-lg border-l-4 border-destructive bg-destructive/5 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </motion.div>
          )}
        </form>
      </motion.div>

      {/* Protocol Legend Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="mt-8"
      >
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
      </motion.div>
    </div>
  );
};
