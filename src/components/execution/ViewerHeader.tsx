import { motion } from "framer-motion";

interface ViewerHeaderProps {
  workflowId: string;
  children: React.ReactNode;
}

export const ViewerHeader = ({ workflowId, children }: ViewerHeaderProps) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="w-full max-w-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3"
  >
    <div>
      <h2 className="text-2xl font-bold text-foreground">Workflow Execution</h2>
      {workflowId && (
        <p className="text-sm font-mono text-muted-foreground break-all">{workflowId}</p>
      )}
    </div>
    {children}
  </motion.div>
);
