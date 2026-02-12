import { useState, useEffect, useCallback } from "react";
import type { WorkflowEvent } from "./execution/types";
import { ViewerHeader } from "./execution/ViewerHeader";
import { StatusIndicator } from "./execution/StatusIndicator";
import { EventStream } from "./execution/EventStream";

export type { WorkflowEvent } from "./execution/types";

interface ExecutionViewerProps {
  workflowId: string;
  prompt: string;
  onComplete: () => void;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export const ExecutionViewer = ({ workflowId, prompt, onComplete }: ExecutionViewerProps) => {
  const [events, setEvents] = useState<WorkflowEvent[]>([]);
  const [status, setStatus] = useState<"running" | "completed" | "error">("running");

  const addEvent = useCallback((evt: WorkflowEvent) => {
    setEvents((prev) => [...prev, evt]);
  }, []);

  // SSE connection via EventSource
  useEffect(() => {
    const eventSource = new EventSource(
      `${BACKEND_URL}/api/v1/workflows/${workflowId}/stream`
    );

    eventSource.onmessage = (event) => {
      const eventData: WorkflowEvent = JSON.parse(event.data);
      const evt: WorkflowEvent = {
        ...eventData,
        id: crypto.randomUUID(),
        timestamp: eventData.timestamp || new Date().toISOString(),
      };

      addEvent(evt);

      if (evt.event_type === "COMPLETED") {
        setStatus("completed");
        eventSource.close();
        onComplete();
      }
      if (evt.event_type === "ERROR") {
        setStatus("error");
        eventSource.close();
        onComplete();
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      setStatus((prev) => {
        if (prev === "running") {
          addEvent({
            id: crypto.randomUUID(),
            workflow_id: workflowId,
            event_type: "ERROR",
            protocol: "SYSTEM",
            data: { error: "Connection to server lost" },
            timestamp: new Date().toISOString(),
          });
          onComplete();
          return "error";
        }
        return prev;
      });
    };

    return () => eventSource.close();
  }, [workflowId, addEvent, onComplete]);

  return (
    <div className="w-full flex flex-col items-center mt-8">
      <ViewerHeader workflowId={workflowId}>
        <StatusIndicator status={status} />
      </ViewerHeader>
      <EventStream events={events} status={status} />
    </div>
  );
};
