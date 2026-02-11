import { motion } from "framer-motion";
import type { WorkflowEvent } from "./types";

const protocolBadge: Record<string, { bg: string; text: string; border: string }> = {
  MCP: { bg: "bg-protocol-purple/10", text: "text-protocol-purple", border: "border-protocol-purple/20" },
  A2A: { bg: "bg-protocol-orange/10", text: "text-protocol-orange", border: "border-protocol-orange/20" },
  SYSTEM: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" },
};

const eventBorder: Record<string, string> = {
  LOG: "border-l-4 border-l-primary/50 bg-secondary/40",
  COMPLETED: "border-l-4 border-l-protocol-green bg-protocol-green/5",
  ERROR: "border-l-4 border-l-destructive bg-destructive/5",
};

const getEventMessage = (evt: WorkflowEvent): string =>
  evt.data?.message || evt.data?.error || "";

const getEventResult = (evt: WorkflowEvent): unknown | undefined =>
  evt.data?.result;

const formatTime = (ts: string) => {
  try {
    return new Date(ts).toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return "";
  }
};

interface EventCardProps {
  event: WorkflowEvent;
}

export const EventCard = ({ event: evt }: EventCardProps) => (
  <motion.div
    initial={{ opacity: 0, x: 30 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.25 }}
    className={`rounded-lg p-4 ${eventBorder[evt.event_type] || "bg-secondary/30"}`}
    role="article"
    aria-label={`${evt.event_type} event${evt.protocol ? ` via ${evt.protocol}` : ""}: ${getEventMessage(evt)}`}
  >
    <div className="flex items-start gap-3">
      {/* Protocol Badge */}
      {evt.protocol && protocolBadge[evt.protocol] && (
        <span
          className={`px-2 py-1 text-xs font-bold rounded border shrink-0 ${protocolBadge[evt.protocol].bg} ${protocolBadge[evt.protocol].text} ${protocolBadge[evt.protocol].border}`}
          aria-label={`Protocol: ${evt.protocol}`}
        >
          {evt.protocol}
        </span>
      )}

      <div className="flex-1 min-w-0">
        <span className="font-semibold text-foreground text-sm">{evt.event_type}</span>
        <p className="text-sm text-muted-foreground mt-0.5">{getEventMessage(evt)}</p>

        {/* Final Result */}
        {evt.event_type === "COMPLETED" && getEventResult(evt) && (
          <div className="border-t border-border pt-3 mt-3">
            <p className="text-sm font-semibold text-protocol-green">🎉 Final Result:</p>
            <pre className="text-lg font-bold text-foreground mt-1 whitespace-pre-wrap font-mono">
              {typeof getEventResult(evt) === "object"
                ? JSON.stringify(getEventResult(evt), null, 2)
                : String(getEventResult(evt))}
            </pre>
          </div>
        )}
      </div>

      {/* Timestamp */}
      <time className="text-xs text-muted-foreground shrink-0 font-mono" dateTime={evt.timestamp}>
        {formatTime(evt.timestamp)}
      </time>
    </div>
  </motion.div>
);
