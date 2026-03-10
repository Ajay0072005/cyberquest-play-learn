import React from "react";
import { Button } from "@/components/ui/button";
import { Play, Map } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/cyber-hero-bg.jpg";
import logo from "@/assets/logo-transparent.png";

export const Hero: React.FC = () => {
  const navigate = useNavigate();
  const scrollToChallenges = () => {
    const challengesSection = document.getElementById('challenges');
    if (challengesSection) {
      challengesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogoClick = () => {
    navigate('/about');
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto">
          {/* Logo */}
          <div className="mb-0 flex justify-center">
            <button 
              onClick={handleLogoClick}
              className="hover:scale-105 transition-transform duration-300 cursor-pointer"
            >
              <img src={logo} alt="CyberQuest" className="h-48 w-48 md:h-64 md:w-64" />
            </button>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-cyber font-bold mb-6 text-foreground">
            CYBERQUEST
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
            Master cybersecurity through interactive challenges, simulations, and gamified learning
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="xl" className="group" onClick={scrollToChallenges}>
              <Play className="h-5 w-5 group-hover:scale-110 transition-transform" />
              Start Learning
            </Button>
            <Button variant="outline" size="xl" className="border-border text-foreground hover:bg-muted" onClick={() => navigate('/path/script-kiddie')}>
              <Map className="h-5 w-5" />
              Career Path
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};