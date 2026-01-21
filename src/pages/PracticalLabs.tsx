import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  FlaskConical, 
  Swords, 
  Search, 
  Crosshair, 
  Shield,
  Clock,
  Trophy,
  ChevronRight,
  CheckCircle2,
  Star,
  Loader2,
  RotateCcw,
  Trash2,
  Database,
  Key,
  Terminal
} from 'lucide-react';
import { MiniLab, MiniLabData } from '@/components/labs/MiniLab';
import { miniLabs } from '@/components/labs/miniLabsData';
import { StoryMission, StoryMissionData } from '@/components/missions/StoryMission';
import { storyMissions } from '@/components/missions/storyMissionsData';
import { useLabProgress } from '@/hooks/useLabProgress';
import { SQLInjectionGame } from '@/components/SQLInjectionGame';
import { CryptoPuzzle } from '@/components/CryptoPuzzle';
import { TerminalChallenge } from '@/components/TerminalChallenge';

const PracticalLabs = () => {
  const navigate = useNavigate();
  const [selectedLab, setSelectedLab] = useState<MiniLabData | null>(null);
  const [selectedMission, setSelectedMission] = useState<StoryMissionData | null>(null);
  
  const { 
    isLabCompleted, 
    completeLab, 
    getProgressByType, 
    getTotalLabPoints,
    resetLabProgress,
    resetAllProgress,
    loading 
  } = useLabProgress();

  const handleLabComplete = async () => {
    if (selectedLab) {
      await completeLab(selectedLab.id, 'minilab', selectedLab.points);
    }
    setSelectedLab(null);
  };

  const handleMissionComplete = async () => {
    if (selectedMission) {
      await completeLab(selectedMission.id, 'mission', selectedMission.points);
    }
    setSelectedMission(null);
  };

  if (selectedLab) {
    return (
      <MiniLab 
        lab={selectedLab} 
        onComplete={handleLabComplete}
        onBack={() => setSelectedLab(null)}
      />
    );
  }

  if (selectedMission) {
    return (
      <StoryMission 
        mission={selectedMission}
        onComplete={handleMissionComplete}
        onBack={() => setSelectedMission(null)}
      />
    );
  }

  // Get completed counts from database
  const completedLabsList = getProgressByType('minilab');
  const completedMissionsList = getProgressByType('mission');
  
  const totalLabPoints = miniLabs.reduce((acc, lab) => acc + lab.points, 0);
  const earnedLabPoints = completedLabsList.reduce((acc, lab) => acc + lab.points_earned, 0);

  const totalMissionPoints = storyMissions.reduce((acc, m) => acc + m.points, 0);
  const earnedMissionPoints = completedMissionsList.reduce((acc, m) => acc + m.points_earned, 0);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header with Reset Button */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-cyber font-bold cyber-glow mb-2">
              Practical & Gamified Labs
            </h1>
            <p className="text-muted-foreground">
              Master cybersecurity through hands-on practice with our Identify → Exploit → Fix workflow and story-driven missions.
            </p>
          </div>
          
          {(completedLabsList.length > 0 || completedMissionsList.length > 0) && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="gap-2 text-destructive border-destructive/50 hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" />
                  Reset All Progress
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset All Lab Progress?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your lab and mission completion records. 
                    You'll be able to replay everything from scratch, but your earned XP will remain.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => resetAllProgress()}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Reset All Progress
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="cyber-bg border-blue-500/30">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <FlaskConical className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedLabsList.length}/{miniLabs.length}</p>
                <p className="text-xs text-muted-foreground">Mini Labs</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="cyber-bg border-purple-500/30">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Swords className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedMissionsList.length}/{storyMissions.length}</p>
                <p className="text-xs text-muted-foreground">Missions</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cyber-bg border-green-500/30">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{getTotalLabPoints()}</p>
                <p className="text-xs text-muted-foreground">XP Earned</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cyber-bg border-yellow-500/30">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalLabPoints + totalMissionPoints}</p>
                <p className="text-xs text-muted-foreground">Total XP Available</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="labs" className="space-y-6">
          <TabsList className="bg-muted/30 flex-wrap h-auto gap-1">
            <TabsTrigger value="labs" className="gap-2">
              <FlaskConical className="h-4 w-4" />
              Mini Labs
            </TabsTrigger>
            <TabsTrigger value="missions" className="gap-2">
              <Swords className="h-4 w-4" />
              Story Missions
            </TabsTrigger>
            <TabsTrigger value="sql" className="gap-2">
              <Database className="h-4 w-4" />
              SQL Game
            </TabsTrigger>
            <TabsTrigger value="crypto" className="gap-2">
              <Key className="h-4 w-4" />
              Crypto Puzzles
            </TabsTrigger>
            <TabsTrigger value="terminal" className="gap-2">
              <Terminal className="h-4 w-4" />
              Terminal
            </TabsTrigger>
          </TabsList>

          {/* Mini Labs Tab */}
          <TabsContent value="labs" className="space-y-6">
            {/* Workflow Explanation */}
            <Card className="cyber-bg border-primary/30">
              <CardContent className="p-6">
                <h3 className="font-cyber font-bold mb-4">The Security Workflow</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                      <Search className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-400">1. Identify</h4>
                      <p className="text-sm text-muted-foreground">Understand and locate the vulnerability in the system</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-orange-500/20 flex items-center justify-center shrink-0">
                      <Crosshair className="h-5 w-5 text-orange-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-orange-400">2. Exploit</h4>
                      <p className="text-sm text-muted-foreground">Perform controlled exploitation in a safe environment</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center shrink-0">
                      <Shield className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-400">3. Fix</h4>
                      <p className="text-sm text-muted-foreground">Apply mitigation and secure the system</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Labs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {miniLabs.map((lab) => {
                const isCompleted = isLabCompleted(lab.id, 'minilab');
                
                return (
                  <Card 
                    key={lab.id}
                    className={`cyber-bg transition-all hover:scale-[1.02] cursor-pointer ${
                      isCompleted ? 'border-green-500/50' : 'border-primary/30 hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedLab(lab)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-primary border-primary/50">
                            {lab.category}
                          </Badge>
                          <Badge 
                            variant="outline"
                            className={
                              lab.difficulty === 'Beginner' ? 'text-green-400 border-green-500/50' :
                              lab.difficulty === 'Intermediate' ? 'text-yellow-400 border-yellow-500/50' :
                              'text-red-400 border-red-500/50'
                            }
                          >
                            {lab.difficulty}
                          </Badge>
                          {isCompleted && (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardTitle className="text-lg font-cyber mt-2">{lab.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{lab.description}</p>
                      
                        <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {lab.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <Trophy className="h-4 w-4 text-yellow-400" />
                            {lab.points} XP
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {isCompleted && (
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="gap-1 text-muted-foreground hover:text-foreground"
                              onClick={(e) => {
                                e.stopPropagation();
                                resetLabProgress(lab.id, 'minilab');
                              }}
                            >
                              <RotateCcw className="h-4 w-4" />
                              Reset
                            </Button>
                          )}
                          <Button size="sm" className="gap-1">
                            {isCompleted ? 'Replay' : 'Start'}
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Story Missions Tab */}
          <TabsContent value="missions" className="space-y-6">
            {/* Mission Explanation */}
            <Card className="cyber-bg border-primary/30">
              <CardContent className="p-6">
                <h3 className="font-cyber font-bold mb-2">Story-Driven Cyber Missions</h3>
                <p className="text-muted-foreground">
                  Experience realistic cyberattack scenarios where your decisions impact outcomes. Choose your role, 
                  make critical choices at decision points, and learn how cybersecurity decisions affect real organizations.
                </p>
              </CardContent>
            </Card>

            {/* Missions Grid */}
            <div className="grid grid-cols-1 gap-6">
              {storyMissions.map((mission) => {
                const isCompleted = isLabCompleted(mission.id, 'mission');
                
                return (
                  <Card 
                    key={mission.id}
                    className={`cyber-bg transition-all hover:scale-[1.01] cursor-pointer ${
                      isCompleted ? 'border-green-500/50' : 'border-primary/30 hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedMission(mission)}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-3">
                            <Badge variant="outline" className="text-primary border-primary/50">
                              {mission.category}
                            </Badge>
                            <Badge 
                              variant="outline"
                              className={
                                mission.difficulty === 'Intermediate' ? 'text-yellow-400 border-yellow-500/50' :
                                'text-red-400 border-red-500/50'
                              }
                            >
                              {mission.difficulty}
                            </Badge>
                            {isCompleted && (
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Completed
                              </Badge>
                            )}
                          </div>
                          
                          <h3 className="text-xl font-cyber font-bold mb-2">{mission.title}</h3>
                          <p className="text-muted-foreground mb-4">{mission.description}</p>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {mission.duration}
                            </span>
                            <span className="flex items-center gap-1">
                              <Trophy className="h-4 w-4 text-yellow-400" />
                              Up to {mission.points} XP
                            </span>
                          </div>
                        </div>
                        
                          <div className="flex flex-col gap-3">
                          <div className="text-sm text-muted-foreground mb-1">Available Roles:</div>
                          <div className="flex gap-2">
                            <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center" title="Analyst">
                              <Search className="h-5 w-5 text-blue-400" />
                            </div>
                            <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center" title="Attacker">
                              <Swords className="h-5 w-5 text-red-400" />
                            </div>
                            <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center" title="Defender">
                              <Shield className="h-5 w-5 text-green-400" />
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            {isCompleted && (
                              <Button 
                                variant="ghost"
                                className="gap-1 text-muted-foreground hover:text-foreground"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  resetLabProgress(mission.id, 'mission');
                                }}
                              >
                                <RotateCcw className="h-4 w-4" />
                                Reset
                              </Button>
                            )}
                            <Button className="gap-2">
                              {isCompleted ? 'Play Again' : 'Start Mission'}
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* SQL Game Tab */}
          <TabsContent value="sql" className="space-y-6">
            <SQLInjectionGame />
          </TabsContent>

          {/* Crypto Puzzles Tab */}
          <TabsContent value="crypto" className="space-y-6">
            <CryptoPuzzle />
          </TabsContent>

          {/* Terminal Tab */}
          <TabsContent value="terminal" className="space-y-6">
            <TerminalChallenge />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default PracticalLabs;
