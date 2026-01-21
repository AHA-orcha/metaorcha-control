import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { NewWorkflow } from "@/components/NewWorkflow";
import { LiveExecution } from "@/components/LiveExecution";

type View = "new-workflow" | "execution";

const Index = () => {
  const [activeNav, setActiveNav] = useState("new-workflow");
  const [currentView, setCurrentView] = useState<View>("new-workflow");
  const [executionPrompt, setExecutionPrompt] = useState("");

  const handleInitialize = (prompt: string) => {
    setExecutionPrompt(prompt);
    setCurrentView("execution");
    setActiveNav("dashboard");
  };

  const handleBackToWorkflow = () => {
    setCurrentView("new-workflow");
    setActiveNav("new-workflow");
    setExecutionPrompt("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        activeItem={activeNav} 
        onNavigate={(item) => {
          setActiveNav(item);
          if (item === "new-workflow") {
            handleBackToWorkflow();
          }
        }} 
      />
      
      <main className="ml-16 min-h-screen">
        {/* Top Bar */}
        <header className="h-14 border-b border-border px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg tracking-tight">MetaOrcha</span>
            <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded-sm">
              TESTNET
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-protocol-green" />
              <span>Connected</span>
            </div>
            <span className="text-border">|</span>
            <span>0x1a2b...9f8e</span>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 h-[calc(100vh-3.5rem)]">
          {currentView === "new-workflow" && (
            <NewWorkflow onInitialize={handleInitialize} />
          )}
          {currentView === "execution" && (
            <LiveExecution 
              prompt={executionPrompt} 
              onBack={handleBackToWorkflow}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
