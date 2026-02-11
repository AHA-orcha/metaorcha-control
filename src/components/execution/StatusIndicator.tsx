import { Check, AlertCircle } from "lucide-react";

interface StatusIndicatorProps {
  status: "running" | "completed" | "error";
}

const statusText: Record<string, string> = {
  running: "Workflow is running",
  completed: "Workflow completed successfully",
  error: "Workflow failed",
};

export const StatusIndicator = ({ status }: StatusIndicatorProps) => (
  <div
    className="flex items-center gap-2"
    role="status"
    aria-live="polite"
    aria-label={statusText[status]}
  >
    {status === "running" && (
      <>
        <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" aria-hidden="true" />
        <span className="text-sm font-medium text-primary">Running...</span>
      </>
    )}
    {status === "completed" && (
      <>
        <div className="w-5 h-5 rounded-full bg-protocol-green flex items-center justify-center" aria-hidden="true">
          <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
        </div>
        <span className="text-sm font-medium text-protocol-green">Completed</span>
      </>
    )}
    {status === "error" && (
      <>
        <AlertCircle className="w-5 h-5 text-destructive" aria-hidden="true" />
        <span className="text-sm font-medium text-destructive">Failed</span>
      </>
    )}
  </div>
);
