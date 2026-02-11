import { motion } from "framer-motion";

export const ProtocolLegend = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.35 }}
    className="mt-8 text-center"
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
);
