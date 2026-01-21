import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Cpu } from "lucide-react";

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col items-center justify-center min-h-[60vh]"
    >
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary rounded-sm mb-4">
          <Cpu className="w-3 h-3" />
          <span className="text-xs font-mono uppercase tracking-wider">Protocol Ready</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Mission Control</h1>
        <p className="text-muted-foreground">Initialize your agent swarm with a directive</p>
      </div>

      {/* Input Card */}
      <motion.div 
        className={`protocol-card w-full max-w-2xl p-6 transition-all duration-200 ${
          isFocused ? 'border-foreground' : ''
        }`}
        animate={{ scale: isFocused ? 1.01 : 1 }}
        transition={{ duration: 0.15 }}
      >
        <form onSubmit={handleSubmit}>
          <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
            Directive
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Describe your workflow objective..."
            className="w-full h-32 bg-transparent border-none outline-none resize-none text-lg placeholder:text-muted-foreground/50"
          />
          
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
              <span>Agents: Auto-assigned</span>
              <span>•</span>
              <span>Protocol: A2A + MCP</span>
            </div>
            
            <motion.button
              type="submit"
              disabled={!prompt.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Initialize Agent Swarm
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </form>
      </motion.div>

      {/* Protocol Info */}
      <div className="mt-8 flex items-center gap-6 text-xs text-muted-foreground font-mono">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-protocol-green" />
          <span>Network: Active</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-protocol-blue" />
          <span>Agents: 12 Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-muted-foreground" />
          <span>Block: #1,847,293</span>
        </div>
      </div>
    </motion.div>
  );
};
