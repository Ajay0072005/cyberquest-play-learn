import React from "react";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

export const Navigation: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary cyber-glow" />
          <h1 className="text-2xl font-cyber font-bold cyber-glow">
            CyberQuest
          </h1>
        </div>
        
        <div className="hidden md:flex items-center gap-6">
          <a href="#challenges" className="text-muted-foreground hover:text-primary transition-colors">
            Challenges
          </a>
          <a href="#leaderboard" className="text-muted-foreground hover:text-primary transition-colors">
            Leaderboard
          </a>
          <a href="#about" className="text-muted-foreground hover:text-primary transition-colors">
            About
          </a>
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