import React from "react";
import { Button } from "@/components/ui/button";
import { Shield, Play, Code } from "lucide-react";
import heroImage from "@/assets/cyber-hero-bg.jpg";

export const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
      
      {/* Matrix-style background effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="h-full w-full bg-[linear-gradient(to_right,#00ff4120_1px,transparent_1px),linear-gradient(to_bottom,#00ff4120_1px,transparent_1px)] bg-[size:20px_20px]" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Glitch effect title */}
          <h1 className="text-5xl md:text-7xl font-cyber font-black mb-6 cyber-glow glitch-effect">
            CYBERQUEST
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Master cybersecurity through interactive challenges, simulations, and gamified learning
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button variant="hero" size="xl" className="group">
              <Play className="h-5 w-5 group-hover:scale-110 transition-transform" />
              Start Learning
            </Button>
            <Button variant="outline" size="xl" className="border-primary/50 text-primary hover:bg-primary/10">
              <Code className="h-5 w-5" />
              Browse Challenges
            </Button>
          </div>
          
          {/* Stats */}
          <div className="flex justify-center mt-16">
            <div className="text-center p-6 bg-card/50 rounded-lg backdrop-blur-sm border border-border/50 max-w-xs">
              <div className="text-3xl font-cyber text-secondary mb-2">10K+</div>
              <div className="text-muted-foreground">Active Learners</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating elements */}
      <div className="absolute top-20 left-10 opacity-30">
        <Shield className="h-12 w-12 text-primary animate-pulse" />
      </div>
      <div className="absolute bottom-20 right-10 opacity-30">
        <Code className="h-10 w-10 text-secondary animate-pulse" />
      </div>
    </section>
  );
};