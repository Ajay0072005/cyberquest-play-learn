import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Code, Wifi, Brain, Database } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ChallengeCardProps {
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  category: string;
  icon?: string;
  challenges: number;
  completed: number;
  link?: string;
}

const getIcon = (category: string) => {
  const icons = {
    "Web Security": Code,
    "Network Security": Wifi,
    "Cryptography": Lock,
    "System Security": Shield,
    "Social Engineering": Brain,
    "Database Security": Database,
    "General": Shield,
  };
  return icons[category as keyof typeof icons] || Shield;
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Beginner":
      return "bg-cyber-green/20 text-cyber-green border-cyber-green/30";
    case "Intermediate":
      return "bg-cyber-blue/20 text-cyber-blue border-cyber-blue/30";
    case "Advanced":
      return "bg-cyber-purple/20 text-cyber-purple border-cyber-purple/30";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export const ChallengeCard: React.FC<ChallengeCardProps> = ({
  title,
  description,
  difficulty,
  category,
  challenges,
  completed,
  link,
}) => {
  const IconComponent = getIcon(category);
  const progress = (completed / challenges) * 100;
  const navigate = useNavigate();

  const handleStartChallenge = () => {
    if (link) {
      navigate(link);
    } else {
      // For challenges without a link, show coming soon message
      alert("This challenge is coming soon!");
    }
  };

  return (
    <Card className="group hover:shadow-md transition-all duration-200 border-border hover:border-primary/40">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <IconComponent className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                {title}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{category}</p>
            </div>
          </div>
          <Badge variant="outline" className={getDifficultyColor(difficulty)}>
            {difficulty}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <CardDescription className="text-muted-foreground">
          {description}
        </CardDescription>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium text-foreground">
              {completed}/{challenges} challenges
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <Button 
          className="w-full"
          onClick={handleStartChallenge}
        >
          {completed === 0 ? "Start Challenge" : "Continue"}
        </Button>
      </CardContent>
    </Card>
  );
};