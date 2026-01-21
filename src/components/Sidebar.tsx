import { LayoutDashboard, Plus, Activity, Key } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeItem: string;
  onNavigate: (item: string) => void;
}

const navItems = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "new-workflow", icon: Plus, label: "New Workflow" },
  { id: "activity", icon: Activity, label: "Activity Log" },
  { id: "credentials", icon: Key, label: "Credentials" },
];

export const Sidebar = ({ activeItem, onNavigate }: SidebarProps) => {
  return (
    <aside className="w-16 h-screen border-r border-border bg-background flex flex-col items-center py-6 fixed left-0 top-0">
      {/* Logo */}
      <div className="mb-8">
        <div className="w-8 h-8 bg-foreground rounded-sm flex items-center justify-center">
          <span className="text-background font-bold text-xs">MO</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "w-10 h-10 flex items-center justify-center rounded-sm transition-colors",
                isActive 
                  ? "bg-secondary" 
                  : "hover:bg-secondary/50"
              )}
              title={item.label}
            >
              <Icon 
                className={cn(
                  "w-5 h-5",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )} 
                strokeWidth={isActive ? 2 : 1.5}
              />
            </button>
          );
        })}
      </nav>

      {/* Protocol Version */}
      <div className="text-[10px] text-muted-foreground font-mono">
        v0.1
      </div>
    </aside>
  );
};
