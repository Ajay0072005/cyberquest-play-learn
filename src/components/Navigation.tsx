import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

export const Navigation: React.FC = () => {
  const location = useLocation();
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary cyber-glow" />
          <h1 className="text-2xl font-cyber font-bold cyber-glow">
            CyberQuest
          </h1>
        </Link>
        
        <div className="hidden md:flex items-center gap-6">
          <Link 
            to="/dashboard" 
            className={`transition-colors ${
              location.pathname === '/dashboard' 
                ? 'text-primary cyber-glow' 
                : 'text-muted-foreground hover:text-primary'
            }`}
          >
            Dashboard
          </Link>
          <Link 
            to="/sql-game" 
            className={`transition-colors ${
              location.pathname === '/sql-game' 
                ? 'text-primary cyber-glow' 
                : 'text-muted-foreground hover:text-primary'
            }`}
          >
            SQL Game
          </Link>
          <Link 
            to="/crypto-puzzles" 
            className={`transition-colors ${
              location.pathname === '/crypto-puzzles' 
                ? 'text-primary cyber-glow' 
                : 'text-muted-foreground hover:text-primary'
            }`}
          >
            Crypto Puzzles
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost">
            Sign In
          </Button>
          <Button variant="cyber">
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  );
};