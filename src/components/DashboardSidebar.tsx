import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Database, 
  Key, 
  Terminal, 
  Trophy, 
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  MessageSquare,
  Award,
  BookOpen,
  FlaskConical,
  ShieldAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useAdminRole } from '@/hooks/useAdminRole';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: BookOpen, label: 'Sherlock Course', path: '/sherlock-course' },
  { icon: FlaskConical, label: 'Practical Labs', path: '/practical-labs' },
  { icon: Database, label: 'SQL Game', path: '/sql-game' },
  { icon: Key, label: 'Crypto Puzzles', path: '/crypto-puzzles' },
  { icon: Terminal, label: 'Terminal', path: '/terminal' },
  { icon: Award, label: 'Achievements', path: '/achievements' },
  { icon: Trophy, label: 'Leaderboard', path: '/leaderboard' },
  { icon: MessageSquare, label: 'AI Chat', path: '/chat' },
];

export const DashboardSidebar: React.FC = () => {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { isAdmin } = useAdminRole();
  const [collapsed, setCollapsed] = useState(false);

  const adminItems = isAdmin ? [
    { icon: ShieldAlert, label: 'Admin: Roles', path: '/admin/roles' },
  ] : [];

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-full bg-card border-r border-border z-40 transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <Link to="/" className={cn("flex items-center gap-2", collapsed && "justify-center w-full")}>
          <Shield className="h-8 w-8 text-primary cyber-glow flex-shrink-0" />
          {!collapsed && (
            <span className="text-xl font-cyber font-bold cyber-glow">CyberQuest</span>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn("h-8 w-8", collapsed && "absolute -right-3 top-6 bg-card border border-border rounded-full")}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {[...navItems, ...adminItems].map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                isActive 
                  ? "bg-primary/20 text-primary border border-primary/30" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-2"
              )}
            >
              <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "cyber-glow")} />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-2 border-t border-border space-y-1">
        <Link
          to="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all",
            collapsed && "justify-center px-2"
          )}
        >
          <Settings className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Settings</span>}
        </Link>
        
        <button
          onClick={signOut}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-all",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Sign Out</span>}
        </button>

        {/* User info */}
        {!collapsed && user && (
          <div className="px-3 py-2 text-xs text-muted-foreground truncate">
            {user.email}
          </div>
        )}
      </div>
    </aside>
  );
};
