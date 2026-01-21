import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, Trophy, FlaskConical, Settings } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/practical-labs", label: "Labs", icon: FlaskConical },
  { to: "/leaderboard", label: "Ranks", icon: Trophy },
  { to: "/settings", label: "Profile", icon: Settings },
];

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Only show for logged-in users on mobile
  if (!user) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border md:hidden">
      <div className="flex items-center justify-around py-2 px-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          const Icon = item.icon;
          
          return (
            <button
              key={item.to}
              onClick={() => navigate(item.to)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px] ${
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "text-primary" : ""}`} />
              <span className={`text-[10px] font-medium ${isActive ? "text-primary" : ""}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 h-0.5 w-8 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
