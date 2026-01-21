import { LayoutDashboard, Plus, Activity, Key, Code2, LogOut, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { id: "/", icon: LayoutDashboard, label: "Dashboard", roles: ['user', 'developer', 'admin'] },
  { id: "/developer", icon: Code2, label: "Developer Portal", roles: ['developer', 'admin'] },
  { id: "/admin", icon: Shield, label: "Admin Panel", roles: ['admin'] },
  { id: "/activity", icon: Activity, label: "Activity Log", roles: ['user', 'developer', 'admin'] },
  { id: "/credentials", icon: Key, label: "Credentials", roles: ['user', 'developer', 'admin'] },
];

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, role } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <aside className="w-16 h-screen border-r border-border bg-background flex flex-col items-center py-6 fixed left-0 top-0 z-50">
      {/* Logo */}
      <div className="mb-8">
        <div className="w-8 h-8 bg-foreground rounded-sm flex items-center justify-center">
          <span className="text-background font-bold text-xs">MO</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 flex-1">
        {navItems
          .filter((item) => !role || item.roles.includes(role))
          .map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
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

      {/* Role Badge & Sign Out */}
      <div className="flex flex-col items-center gap-2">
        {role && (
          <div className="text-[9px] text-muted-foreground font-mono uppercase px-1 py-0.5 bg-secondary rounded">
            {role}
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="w-10 h-10 flex items-center justify-center rounded-sm hover:bg-destructive/10 transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
        </button>
        <div className="text-[10px] text-muted-foreground font-mono">
          v0.1
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
