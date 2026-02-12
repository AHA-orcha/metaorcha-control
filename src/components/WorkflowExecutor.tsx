import { useState, useCallback } from "react";
import { HeroSection } from "./workflow/HeroSection";
import { WorkflowInputCard } from "./workflow/WorkflowInputCard";
import { ProtocolLegend } from "./workflow/ProtocolLegend";
import { ExecutionViewer } from "./ExecutionViewer";
import { MockPreview } from "./execution/MockPreview";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export const WorkflowExecutor = () => {
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (inputPrompt: string) => {
    setPrompt(inputPrompt);
    setError(null);
    setIsExecuting(true);
    setWorkflowId(null);

    try {
      const resp = await fetch(`${BACKEND_URL}/api/v1/workflows`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: inputPrompt }),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        let errMsg = "Workflow submission failed";
        try {
          errMsg = JSON.parse(errText).error || errMsg;
        } catch {}
        setError(errMsg);
        setIsExecuting(false);
        return;
      }

      const { workflow_id } = await resp.json();
      if (!workflow_id) {
        setError("No workflow ID returned");
        setIsExecuting(false);
        return;
      }

      setWorkflowId(workflow_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed");
      setIsExecuting(false);
    }
  }, []);

  const handleExecutionComplete = useCallback(() => {
    setIsExecuting(false);
  }, []);

  return (
    <main
      className="hero-gradient min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-4 sm:px-6 -m-6 py-12"
      role="main"
      aria-label="MetaOrcha Workflow Executor"
    >
      <HeroSection />
      <WorkflowInputCard
        onSubmit={handleSubmit}
        isExecuting={isExecuting}
        error={error}
      />

      {workflowId ? (
        <ExecutionViewer
          workflowId={workflowId}
          prompt={prompt}
          onComplete={handleExecutionComplete}
        />
      ) : (
        <MockPreview />
      )}

      <ProtocolLegend />
    </main>
  );
};
