import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, X } from "lucide-react";

interface InterruptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  agent: string;
  action: string;
}

export const InterruptModal = ({
  isOpen,
  onClose,
  onApprove,
  onReject,
  agent,
  action,
}: InterruptModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="protocol-card bg-background p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-sm bg-protocol-yellow/10 flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5 text-protocol-yellow" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">Authorization Required</h2>
                    <p className="text-xs font-mono text-muted-foreground">
                      Human-in-the-loop checkpoint
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-secondary rounded-sm transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 bg-secondary rounded-sm mb-6">
                <p className="text-sm">
                  Agent <span className="font-mono font-medium">{agent}</span> requests permission to:
                </p>
                <p className="mt-2 font-medium">{action}</p>
              </div>

              {/* Risk Level */}
              <div className="flex items-center gap-2 mb-6 text-xs font-mono">
                <span className="text-muted-foreground">Risk Level:</span>
                <span className="px-2 py-0.5 bg-protocol-yellow/10 text-protocol-yellow rounded-sm">
                  MEDIUM
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onReject}
                  className="flex-1 px-4 py-3 border border-border rounded-sm font-medium hover:bg-secondary transition-colors"
                >
                  Reject
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onApprove}
                  className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-sm font-medium"
                >
                  Sign & Approve
                </motion.button>
              </div>

              {/* Footer */}
              <p className="text-[10px] text-muted-foreground text-center mt-4 font-mono">
                This action will be logged on the activity chain
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
