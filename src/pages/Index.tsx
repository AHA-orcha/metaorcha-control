import { Sidebar } from "@/components/Sidebar";
import { WorkflowExecutor } from "@/components/WorkflowExecutor";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-16 min-h-screen">
        {/* Top Bar */}
        <header className="h-14 border-b border-border px-6 flex items-center justify-between bg-card/80 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg tracking-tight gradient-text">MetaOrcha</span>
            <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
              TESTNET
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-protocol-green" />
              <span>Connected</span>
            </div>
            <span className="text-border">|</span>
            <span>{user?.email?.slice(0, 8)}...</span>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 h-[calc(100vh-3.5rem)]">
          <WorkflowExecutor />
        </div>
      </main>
    </div>
  );
};

export default Index;
