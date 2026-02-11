import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { WorkflowEvent } from "./types";
import { EventCard } from "./EventCard";
import { EmptyState } from "./EmptyState";

interface EventStreamProps {
  events: WorkflowEvent[];
  status: "running" | "completed" | "error";
}

export const EventStream = ({ events, status }: EventStreamProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="protocol-card w-full max-w-3xl overflow-hidden"
      role="log"
      aria-label="Workflow event stream"
      aria-live="polite"
      aria-relevant="additions"
    >
      <div ref={scrollRef} className="max-h-96 overflow-y-auto p-4 space-y-3">
        <AnimatePresence mode="popLayout">
          {events.length === 0 && status === "running" && <EmptyState />}
          {events.map((evt) => (
            <EventCard key={evt.id} event={evt} />
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
