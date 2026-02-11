import { useState } from "react";
import { motion } from "framer-motion";
import { ExampleQueries } from "./ExampleQueries";
import { ExecuteButton } from "./ExecuteButton";
import { ErrorBanner } from "./ErrorBanner";

interface WorkflowInputCardProps {
  onSubmit: (prompt: string) => void;
  isExecuting: boolean;
  error: string | null;
}

export const WorkflowInputCard = ({ onSubmit, isExecuting, error }: WorkflowInputCardProps) => {
  const [prompt, setPrompt] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isExecuting) return;
    onSubmit(prompt);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
      className="protocol-card w-full max-w-2xl p-8"
    >
      <form onSubmit={handleSubmit}>
        <label className="block text-sm font-semibold text-foreground mb-2">
          What would you like the agents to do?
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          rows={4}
          placeholder={`e.g. "Calculate 5+3 and convert the result to words"\ne.g. "Multiply 6 by 7 then convert to English"`}
          className={`w-full rounded-xl px-4 py-3 text-sm resize-none outline-none bg-card transition-all duration-200 border-2 ${
            isFocused
              ? "border-primary ring-2 ring-primary/30 border-transparent"
              : "border-border"
          } placeholder:text-muted-foreground/50`}
        />

        <ExampleQueries onSelect={setPrompt} />

        <ExecuteButton
          disabled={!prompt.trim() || isExecuting}
          isSubmitting={isExecuting}
        />

        {error && <ErrorBanner message={error} />}
      </form>
    </motion.div>
  );
};
