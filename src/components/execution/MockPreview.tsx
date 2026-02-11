import { motion } from "framer-motion";
import type { WorkflowEvent } from "./types";
import { EventCard } from "./EventCard";

const mockEvents: WorkflowEvent[] = [
  {
    id: "mock-1",
    workflow_id: "demo-preview",
    event_type: "LOG",
    protocol: "SYSTEM",
    data: { message: "Initializing MetaOrcha orchestration engine..." },
    timestamp: new Date().toISOString(),
  },
  {
    id: "mock-2",
    workflow_id: "demo-preview",
    event_type: "LOG",
    protocol: "MCP",
    data: { message: "MCP handshake complete. Tools registered: [calculate, parse, format]" },
    timestamp: new Date().toISOString(),
  },
  {
    id: "mock-3",
    workflow_id: "demo-preview",
    event_type: "LOG",
    protocol: "A2A",
    data: { message: "A2A agent 'TextConverter-01' connected. Capabilities: [text-transform, number-to-words]" },
    timestamp: new Date().toISOString(),
  },
  {
    id: "mock-4",
    workflow_id: "demo-preview",
    event_type: "COMPLETED",
    protocol: "SYSTEM",
    data: {
      message: "Workflow completed successfully",
      result: {
        calculation: "5 + 3",
        numeric_result: 8,
        text_result: "eight",
        explanation: "Added 5 and 3 to get 8, then converted to English word 'eight'",
      },
    },
    timestamp: new Date().toISOString(),
  },
];

export const MockPreview = () => (
  <div className="w-full flex flex-col items-center mt-8 max-w-3xl mx-auto">
    {/* Preview banner */}
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="w-full mb-4 px-4 py-2.5 rounded-lg bg-primary/5 border border-primary/20 text-center"
    >
      <p className="text-sm text-primary font-medium">
        ✨ Submit a workflow above to see real orchestration
      </p>
    </motion.div>

    {/* Mock event stream */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="protocol-card w-full overflow-hidden opacity-60"
      aria-hidden="true"
    >
      <div className="p-4 space-y-3">
        {mockEvents.map((evt) => (
          <EventCard key={evt.id} event={evt} />
        ))}
      </div>
    </motion.div>
  </div>
);
