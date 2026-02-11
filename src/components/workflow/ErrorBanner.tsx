import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

interface ErrorBannerProps {
  message: string;
}

export const ErrorBanner = ({ message }: ErrorBannerProps) => (
  <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    className="mt-4 p-4 rounded-lg border-l-4 border-destructive bg-destructive/5 flex items-start gap-3"
  >
    <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
    <p className="text-sm text-destructive">{message}</p>
  </motion.div>
);
