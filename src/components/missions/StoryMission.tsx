import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Sword, 
  Search,
  ArrowLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Server,
  FileText,
  Trophy
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGame } from '@/context/GameContext';

export type Role = 'analyst' | 'attacker' | 'defender';

export interface DecisionPoint {
  id: string;
  situation: string;
  context: string;
  options: {
    id: string;
    text: string;
    consequence: string;
    impact: {
      detection: number;  // -100 to 100
      dataLoss: number;   // -100 to 100
      businessImpact: number; // -100 to 100
    };
    nextScene?: string;
    isOptimal?: boolean;
  }[];
}

export interface MissionScene {
  id: string;
  title: string;
  narration: string;
  decisionPoint?: DecisionPoint;
  isEnding?: boolean;
}

export interface IncidentSummary {
  attackTimeline: string[];
  rootCause: string;
  mitigation: string[];
  prevention: string[];
  lessonsLearned: string;
}

export interface StoryMissionData {
  id: string;
  title: string;
  category: string;
  difficulty: 'Intermediate' | 'Advanced';
  duration: string;
  description: string;
  backgroundStory: string;
  roles: {
    analyst: { description: string; focus: string };
    attacker: { description: string; focus: string };
    defender: { description: string; focus: string };
  };
  scenes: Record<string, MissionScene>;
  startScene: string;
  incidentSummary: IncidentSummary;
  points: number;
}

interface StoryMissionProps {
  mission: StoryMissionData;
  onComplete: () => void;
  onBack: () => void;
}

const roleConfig = {
  analyst: {
    icon: Search,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500',
    title: 'Security Analyst',
    description: 'Investigate and analyze the incident'
  },
  attacker: {
    icon: Sword,
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500',
    title: 'Red Team (Attacker)',
    description: 'Understand the attack perspective'
  },
  defender: {
    icon: Shield,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500',
    title: 'Blue Team (Defender)',
    description: 'Contain and remediate the threat'
  }
};

export const StoryMission: React.FC<StoryMissionProps> = ({ mission, onComplete, onBack }) => {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [currentSceneId, setCurrentSceneId] = useState<string>(mission.startScene);
  const [decisions, setDecisions] = useState<{ sceneId: string; optionId: string; impact: any }[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [missionComplete, setMissionComplete] = useState(false);
  const { toast } = useToast();
  const { addPoints, completeChallenge } = useGame();

  const currentScene = mission.scenes[currentSceneId];
  const scenesVisited = decisions.length + 1;
  const totalScenes = Object.keys(mission.scenes).length;

  const calculateScore = () => {
    const totalImpact = decisions.reduce((acc, d) => ({
      detection: acc.detection + (d.impact?.detection || 0),
      dataLoss: acc.dataLoss + (d.impact?.dataLoss || 0),
      businessImpact: acc.businessImpact + (d.impact?.businessImpact || 0)
    }), { detection: 0, dataLoss: 0, businessImpact: 0 });

    const optimalDecisions = decisions.filter(d => {
      const scene = mission.scenes[d.sceneId];
      const option = scene?.decisionPoint?.options.find(o => o.id === d.optionId);
      return option?.isOptimal;
    }).length;

    return {
      ...totalImpact,
      optimalDecisions,
      totalDecisions: decisions.length,
      percentage: Math.max(0, Math.min(100, 50 + (totalImpact.detection - totalImpact.dataLoss - totalImpact.businessImpact) / 3))
    };
  };

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    toast({
      title: `Role Selected: ${roleConfig[role].title}`,
      description: roleConfig[role].description,
    });
  };

  const handleDecision = (optionId: string) => {
    const option = currentScene.decisionPoint?.options.find(o => o.id === optionId);
    if (!option) return;

    setDecisions(prev => [...prev, {
      sceneId: currentSceneId,
      optionId,
      impact: option.impact
    }]);

    toast({
      title: option.isOptimal ? "✅ Good Decision!" : "⚠️ Decision Made",
      description: option.consequence,
      variant: option.isOptimal ? "default" : "destructive"
    });

    if (option.nextScene) {
      setCurrentSceneId(option.nextScene);
    } else if (currentScene.isEnding || !option.nextScene) {
      setShowSummary(true);
    }
  };

  const handleCompleteMission = () => {
    const score = calculateScore();
    const earnedPoints = Math.round((score.percentage / 100) * mission.points);
    
    addPoints(earnedPoints);
    completeChallenge(`mission-${mission.id}`);
    setMissionComplete(true);
    
    toast({
      title: "🎉 Mission Complete!",
      description: `You earned ${earnedPoints} XP based on your decisions!`,
    });
  };

  // Role Selection Screen
  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={onBack} className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <Card className="cyber-bg border-primary/30 mb-8">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-primary border-primary/50">
                  {mission.category}
                </Badge>
                <Badge variant="outline" className="text-yellow-400 border-yellow-500/50">
                  {mission.difficulty}
                </Badge>
                <Badge variant="outline" className="text-muted-foreground">
                  {mission.duration}
                </Badge>
              </div>
              <CardTitle className="text-3xl font-cyber">{mission.title}</CardTitle>
              <p className="text-muted-foreground mt-2">{mission.description}</p>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/20 rounded-lg p-4 mb-6">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Background
                </h4>
                <p className="text-sm text-muted-foreground">{mission.backgroundStory}</p>
              </div>
              
              <div className="text-right">
                <span className="text-2xl font-bold text-primary">{mission.points}</span>
                <span className="text-muted-foreground ml-1">XP possible</span>
              </div>
            </CardContent>
          </Card>

          <h3 className="text-xl font-cyber mb-4 text-center">Choose Your Role</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(Object.keys(roleConfig) as Role[]).map((role) => {
              const config = roleConfig[role];
              const Icon = config.icon;
              const roleData = mission.roles[role];

              return (
                <Card 
                  key={role}
                  className={`cyber-bg cursor-pointer transition-all hover:scale-105 border-2 ${config.borderColor}/30 hover:${config.borderColor}`}
                  onClick={() => handleRoleSelect(role)}
                >
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 rounded-full ${config.bgColor} flex items-center justify-center mx-auto mb-4`}>
                      <Icon className={`h-8 w-8 ${config.color}`} />
                    </div>
                    <h4 className={`font-cyber font-bold ${config.color} mb-2`}>{config.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{roleData.description}</p>
                    <Badge variant="outline" className={`${config.color} ${config.borderColor}/50`}>
                      Focus: {roleData.focus}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Mission Complete Screen
  if (missionComplete) {
    const score = calculateScore();
    
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <Card className="cyber-bg border-green-500/50">
            <CardContent className="p-8 text-center">
              <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                <Trophy className="h-12 w-12 text-green-400" />
              </div>
              <h2 className="text-3xl font-cyber font-bold text-green-400 mb-4">
                Mission Accomplished!
              </h2>
              <p className="text-muted-foreground mb-6">
                You've completed the {mission.title} mission as a {roleConfig[selectedRole].title}.
              </p>
              
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-muted/20 rounded-lg p-4">
                  <div className="text-2xl font-bold text-primary">{score.optimalDecisions}/{score.totalDecisions}</div>
                  <div className="text-xs text-muted-foreground">Optimal Decisions</div>
                </div>
                <div className="bg-muted/20 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-400">{Math.round(score.percentage)}%</div>
                  <div className="text-xs text-muted-foreground">Success Rate</div>
                </div>
                <div className="bg-muted/20 rounded-lg p-4">
                  <div className="text-2xl font-bold text-yellow-400">+{Math.round((score.percentage / 100) * mission.points)}</div>
                  <div className="text-xs text-muted-foreground">XP Earned</div>
                </div>
              </div>

              <Button onClick={onComplete} className="bg-gradient-to-r from-primary to-primary/70">
                Return to Missions
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Incident Summary Screen
  if (showSummary) {
    const score = calculateScore();
    
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="cyber-bg border-primary/30 mb-6">
            <CardHeader>
              <CardTitle className="text-2xl font-cyber flex items-center gap-3">
                <FileText className="h-6 w-6 text-primary" />
                Incident Summary Report
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`rounded-lg p-4 ${score.detection > 0 ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {score.detection > 0 ? <CheckCircle2 className="h-4 w-4 text-green-400" /> : <XCircle className="h-4 w-4 text-red-400" />}
                    <span className="text-sm font-semibold">Detection</span>
                  </div>
                  <div className={`text-2xl font-bold ${score.detection > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {score.detection > 0 ? 'Success' : 'Delayed'}
                  </div>
                </div>
                <div className={`rounded-lg p-4 ${score.dataLoss < 50 ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Server className="h-4 w-4" />
                    <span className="text-sm font-semibold">Data Loss</span>
                  </div>
                  <div className={`text-2xl font-bold ${score.dataLoss < 50 ? 'text-green-400' : 'text-red-400'}`}>
                    {score.dataLoss < 50 ? 'Minimal' : 'Significant'}
                  </div>
                </div>
                <div className={`rounded-lg p-4 ${score.businessImpact < 50 ? 'bg-green-500/10 border border-green-500/30' : 'bg-yellow-500/10 border border-yellow-500/30'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4" />
                    <span className="text-sm font-semibold">Business Impact</span>
                  </div>
                  <div className={`text-2xl font-bold ${score.businessImpact < 50 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {score.businessImpact < 50 ? 'Contained' : 'Moderate'}
                  </div>
                </div>
              </div>

              {/* Attack Timeline */}
              <div className="bg-muted/20 rounded-lg p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Attack Timeline
                </h4>
                <div className="space-y-2">
                  {mission.incidentSummary.attackTimeline.map((event, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      <p className="text-sm text-muted-foreground">{event}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Root Cause */}
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-red-400">
                  <AlertTriangle className="h-4 w-4" />
                  Root Cause Analysis
                </h4>
                <p className="text-sm text-muted-foreground">{mission.incidentSummary.rootCause}</p>
              </div>

              {/* Mitigation & Prevention */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 text-blue-400">Mitigation Steps</h4>
                  <ul className="space-y-1">
                    {mission.incidentSummary.mitigation.map((step, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-blue-400">•</span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 text-green-400">Prevention Recommendations</h4>
                  <ul className="space-y-1">
                    {mission.incidentSummary.prevention.map((step, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-green-400">•</span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Lessons Learned */}
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-yellow-400">Lessons Learned</h4>
                <p className="text-sm text-muted-foreground">{mission.incidentSummary.lessonsLearned}</p>
              </div>

              <Button 
                onClick={handleCompleteMission}
                className="w-full bg-gradient-to-r from-primary to-primary/70"
              >
                Complete Mission & Claim XP
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Active Scene
  const roleConf = roleConfig[selectedRole];
  const RoleIcon = roleConf.icon;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Exit Mission
          </Button>
          <Badge className={`${roleConf.bgColor} ${roleConf.color} border ${roleConf.borderColor}/50`}>
            <RoleIcon className="h-3 w-3 mr-1" />
            {roleConf.title}
          </Badge>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Mission Progress</span>
            <span className="text-primary">Scene {scenesVisited}</span>
          </div>
          <Progress value={(scenesVisited / totalScenes) * 100} className="h-2" />
        </div>

        {/* Current Scene */}
        <Card className="cyber-bg border-primary/30 mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-cyber">{currentScene.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed mb-6">{currentScene.narration}</p>

            {currentScene.decisionPoint && (
              <div className="space-y-4">
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Decision Required
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">{currentScene.decisionPoint.situation}</p>
                  <p className="text-xs text-muted-foreground italic">{currentScene.decisionPoint.context}</p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {currentScene.decisionPoint.options.map((option) => (
                    <Button
                      key={option.id}
                      variant="outline"
                      className="h-auto py-4 px-4 text-left justify-start hover:border-primary/50"
                      onClick={() => handleDecision(option.id)}
                    >
                      <ChevronRight className="h-4 w-4 mr-3 shrink-0" />
                      <span>{option.text}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {currentScene.isEnding && !currentScene.decisionPoint && (
              <Button 
                onClick={() => setShowSummary(true)}
                className="w-full bg-gradient-to-r from-primary to-primary/70"
              >
                View Incident Summary
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
