import React from "react";
import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { ChallengeCard } from "@/components/ChallengeCard";

const Index = () => {
  const challenges = [
    {
      title: "SQL Injection Basics",
      description: "Learn to identify and exploit SQL injection vulnerabilities in web applications",
      difficulty: "Beginner" as const,
      category: "Web Security",
      challenges: 8,
      completed: 3,
    },
    {
      title: "Network Penetration",
      description: "Master network scanning, enumeration, and exploitation techniques",
      difficulty: "Intermediate" as const,
      category: "Network Security",
      challenges: 12,
      completed: 0,
    },
    {
      title: "Advanced Cryptography",
      description: "Dive deep into modern cryptographic systems and their weaknesses",
      difficulty: "Advanced" as const,
      category: "Cryptography",
      challenges: 15,
      completed: 7,
    },
    {
      title: "Social Engineering",
      description: "Understand human psychological manipulation in cybersecurity contexts",
      difficulty: "Intermediate" as const,
      category: "Social Engineering",
      challenges: 10,
      completed: 5,
    },
    {
      title: "Database Security",
      description: "Secure database systems and protect against data breaches",
      difficulty: "Beginner" as const,
      category: "Database Security",
      challenges: 6,
      completed: 6,
    },
    {
      title: "Mobile Security",
      description: "Discover vulnerabilities in iOS and Android applications",
      difficulty: "Advanced" as const,
      category: "General",
      challenges: 20,
      completed: 2,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      
      {/* Challenges Section */}
      <section id="challenges" className="py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-cyber font-bold mb-4 cyber-glow">
              Choose Your Path
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Embark on specialized cybersecurity learning paths designed to build real-world skills
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
            © 2024 CyberQuest. Empowering the next generation of cybersecurity professionals.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
