import { motion } from "framer-motion";
import { Info, Zap, Network } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const HeroSection = () => (
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
);
