import React from "react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { ChallengeCard } from "@/components/ChallengeCard";
import { ChatBot } from "@/components/ChatBot";
import { PointsDisplay } from "@/components/PointsDisplay";
import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { careerPaths } from "@/data/careerPathsData";

const Index = () => {
  const challenges = [
    {
      title: "Practical Labs",
      description: "Master cybersecurity through hands-on practice with our Identify → Exploit → Fix workflow",
      difficulty: "Beginner" as const,
      category: "Hands-on Training",
      challenges: 10,
      completed: 0,
      link: "/practical-labs",
    },
    {
      title: "Sherlock Course",
      description: "Learn cryptography and security through Victorian-era detective adventures",
      difficulty: "Intermediate" as const,
      category: "Interactive Learning",
      challenges: 5,
      completed: 0,
      link: "/sherlock-course",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      
      {/* Career Path Section */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-cyber font-bold mb-4 cyber-glow">
              Your Cybersecurity Journey
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From complete beginner to elite pentester — follow the path and unlock your potential
            </p>
          </div>
          
          {/* Career Path Timeline */}
          <div className="relative max-w-4xl mx-auto">
            {/* Vertical line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-purple-500 to-primary/30 transform md:-translate-x-1/2" />
            
            {careerPaths.map((stage, index) => {
              const IconComponent = stage.icon;
              return (
                <div 
                  key={stage.level}
                  className={`relative flex items-center mb-12 ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-8 md:left-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background transform -translate-x-1/2 z-10 shadow-[0_0_15px_hsl(var(--primary))]" />
                  
                  {/* Card */}
                  <div className={`ml-16 md:ml-0 md:w-[calc(50%-2rem)] ${index % 2 === 0 ? 'md:pr-8' : 'md:pl-8'}`}>
                    <Link to={`/path/${stage.slug}`}>
                      <Card className="cyber-bg border-primary/30 hover:border-primary/50 transition-all hover:scale-[1.02] group cursor-pointer">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${stage.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                              <IconComponent className="h-7 w-7 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-cyber text-primary">LEVEL {stage.level}</span>
                                <ChevronRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <h3 className="text-xl font-cyber font-bold mb-2 group-hover:text-primary transition-colors">
                                {stage.title}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-4">
                                {stage.description}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {stage.skills.map((skill) => (
                                  <span 
                                    key={skill}
                                    className="px-2 py-1 text-xs rounded-full bg-muted/50 text-muted-foreground border border-border/50"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Challenges Section */}
      <section id="challenges" className="py-20 bg-muted/10">
        <div className="container mx-auto px-4">
          <div className="flex justify-center mb-8">
            <PointsDisplay />
          </div>
          
          <div className="text-center mb-16">
            <h2 className="text-4xl font-cyber font-bold mb-4 cyber-glow">
              Start Training
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Practice your skills with hands-on challenges and level up on your journey
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {challenges.map((challenge, index) => (
              <ChallengeCard key={index} {...challenge} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 bg-card border-t border-border/50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © 2025 CyberQuest. Empowering the next generation of cybersecurity professionals.
          </p>
        </div>
      </footer>
      
      {/* ChatBot */}
      <ChatBot />
    </div>
  );
};

export default Index;
