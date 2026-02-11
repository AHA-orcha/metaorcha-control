import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";

interface ExecuteButtonProps {
  disabled: boolean;
  isSubmitting: boolean;
}

export const ExecuteButton = ({ disabled, isSubmitting }: ExecuteButtonProps) => (
  <motion.button
    type="submit"
    disabled={disabled}
    whileHover={!disabled ? { y: -2 } : {}}
    whileTap={!disabled ? { scale: 0.98 } : {}}
    className={`w-full mt-6 py-4 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
      disabled
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
);
