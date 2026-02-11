import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export const EmptyState = () => (
  <motion.div
    key="empty"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="text-center py-12 text-muted-foreground flex flex-col items-center gap-2"
  >
    <Loader2 className="w-5 h-5 animate-spin" />
    Waiting for workflow events...
  </motion.div>
);
