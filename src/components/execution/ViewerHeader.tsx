import { motion } from "framer-motion";

interface ViewerHeaderProps {
  workflowId: string;
  children: React.ReactNode; // StatusIndicator
}

export const ViewerHeader = ({ workflowId, children }: ViewerHeaderProps) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="w-full max-w-3xl flex items-center justify-between mb-6"
  >
    <div>
      <h2 className="text-2xl font-bold text-foreground">Workflow Execution</h2>
      {workflowId && (
        <p className="text-sm font-mono text-muted-foreground">{workflowId}</p>
      )}
    </div>
    {children}
  </motion.div>
);
