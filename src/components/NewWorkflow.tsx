import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Info, Zap, Network } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NewWorkflowProps {
  onInitialize: (prompt: string) => void;
}

export const NewWorkflow = ({ onInitialize }: NewWorkflowProps) => {
  const [prompt, setPrompt] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onInitialize(prompt);
    }
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
        className={`protocol-card w-full max-w-2xl p-8 transition-shadow duration-200 ${
          isFocused ? "shadow-2xl ring-2 ring-primary/20" : ""
        }`}
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
            placeholder={`e.g. "Research the latest AI news and create a summary report"\ne.g. "Analyze this dataset and generate visualizations"\ne.g. "Draft a project proposal based on these requirements"`}
            className="w-full bg-secondary/50 border border-input rounded-xl px-4 py-3 text-sm resize-none outline-none placeholder:text-muted-foreground/50 focus:border-primary/40 transition-colors"
          />

          <div className="flex items-center justify-between mt-5">
            <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
              <span>Agents: Auto-assigned</span>
              <span className="text-border">•</span>
              <span>Protocol: A2A + MCP</span>
            </div>

            <motion.button
              type="submit"
              disabled={!prompt.trim()}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors hover:opacity-90"
            >
              Initialize Agent Swarm
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </form>
      </motion.div>

      {/* Status Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="mt-8 flex items-center gap-6 text-xs text-muted-foreground font-mono"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-protocol-green" />
          <span>Network: Active</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span>Agents: 12 Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-muted-foreground" />
          <span>Block: #1,847,293</span>
        </div>
      </motion.div>
    </div>
  );
};
