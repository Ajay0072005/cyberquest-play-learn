import React from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, Users, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo-transparent.png";

export default function AboutUs() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <img src={logo} alt="CyberQuest" className="h-24 w-24 drop-shadow-[0_0_20px_rgba(0,255,65,0.4)]" />
            </div>
            <h1 className="text-5xl md:text-6xl font-cyber font-bold cyber-glow mb-4">
              About CyberQuest
            </h1>
            <p className="text-xl text-muted-foreground">
              Empowering the next generation of cybersecurity professionals
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 border-t border-border">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-cyber font-bold cyber-glow mb-4">Our Mission</h2>
              <p className="text-muted-foreground mb-4">
                CyberQuest is dedicated to making cybersecurity education accessible, engaging, and practical for everyone. We believe that cybersecurity skills are essential in today's digital world.
              </p>
              <p className="text-muted-foreground">
                Through interactive challenges, real-world simulations, and gamified learning experiences, we're transforming how people learn and master cybersecurity concepts.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-lg p-6 text-center">
                <Zap className="h-8 w-8 text-primary mx-auto mb-2 cyber-glow" />
                <h3 className="font-bold mb-1">Interactive</h3>
                <p className="text-sm text-muted-foreground">Hands-on learning</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-6 text-center">
                <Target className="h-8 w-8 text-primary mx-auto mb-2 cyber-glow" />
                <h3 className="font-bold mb-1">Practical</h3>
                <p className="text-sm text-muted-foreground">Real-world scenarios</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-6 text-center">
                <Users className="h-8 w-8 text-primary mx-auto mb-2 cyber-glow" />
                <h3 className="font-bold mb-1">Community</h3>
                <p className="text-sm text-muted-foreground">Global learners</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-6 text-center">
                <Shield className="h-8 w-8 text-primary mx-auto mb-2 cyber-glow" />
                <h3 className="font-bold mb-1">Secure</h3>
                <p className="text-sm text-muted-foreground">Safe learning</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-cyber font-bold cyber-glow mb-12 text-center">What We Offer</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl font-bold mb-2 text-primary">Career Paths</h3>
              <p className="text-muted-foreground">
                Structured learning paths from beginner to expert in various cybersecurity specializations.
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl font-bold mb-2 text-primary">Challenges</h3>
              <p className="text-muted-foreground">
                Engaging CTF-style challenges, puzzles, and real-world scenarios to test your skills.
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl font-bold mb-2 text-primary">Gamification</h3>
              <p className="text-muted-foreground">
                Earn points, badges, and achievements to track your progress and celebrate wins.
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl font-bold mb-2 text-primary">AI Tutor</h3>
              <p className="text-muted-foreground">
                Get personalized guidance and explanations from our AI-powered learning assistant.
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl font-bold mb-2 text-primary">Community</h3>
              <p className="text-muted-foreground">
                Connect with other learners, share knowledge, and grow together in our vibrant community.
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl font-bold mb-2 text-primary">Certifications</h3>
              <p className="text-muted-foreground">
                Earn recognized certifications to validate your cybersecurity expertise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 border-t border-border">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-cyber font-bold cyber-glow mb-4">Ready to Start Your Journey?</h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of learners who are mastering cybersecurity with CyberQuest today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" onClick={() => navigate("/register")}>
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate("/")}>
              Back to Home
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
