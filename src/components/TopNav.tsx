import { useLocation, useNavigate } from "react-router-dom";
import { Home, Shield, BarChart3, Bot, Key } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/admin", label: "Overview", icon: Shield },
  { path: "/admin/metrics", label: "Metrics", icon: BarChart3 },
  { path: "/admin/agents", label: "Agents", icon: Bot },
  { path: "/admin/api-keys", label: "API Keys", icon: Key },
];

export const TopNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-ring rounded-sm"
          aria-label="Go to home"
        >
          <div className="w-7 h-7 bg-foreground rounded-sm flex items-center justify-center">
            <span className="text-background font-bold text-[10px]">MO</span>
          </div>
          <span className="font-extrabold text-lg tracking-tight gradient-text">MetaOrcha</span>
          <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">
            TESTNET
          </span>
        </button>

        <nav className="flex items-center gap-1" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path);

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring",
                  isActive
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
