import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { PointsDisplay } from '@/components/PointsDisplay';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Target, 
  Clock, 
  Zap, 
  Shield, 
  Lock,
  CheckCircle,
  TrendingUp,
  Calendar,
  Database,
  Upload,
  Loader2,
  Flame,
  Star,
  Award
} from 'lucide-react';
import { useGame } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Dashboard: React.FC = () => {
  const { points, level, completedChallenges } = useGame();
  const { user } = useAuth();
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const handleImportData = async () => {
    setIsImporting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('import-knowledge');
      
      if (error) throw error;
      
      if (data?.error) {
        toast({
          title: "Import Failed",
          description: data.error,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Import Successful",
          description: `Successfully imported ${data.imported} cybersecurity questions!`,
        });
      }
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: "Failed to import knowledge base. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  const recentActivity = [
    { type: 'challenge', name: 'SQL Injection Basics', points: 150, time: '2 hours ago' },
    { type: 'achievement', name: 'First Blood', points: 50, time: '1 day ago' },
    { type: 'challenge', name: 'Caesar Cipher', points: 100, time: '2 days ago' },
  ];

  const cryptoCompleted = completedChallenges.filter(id => 
    id.includes('crypto') || id.includes('cipher') || id.includes('caesar') || id.includes('vigenere') || id.includes('substitution')
  ).length;
  
  const sqlCompleted = completedChallenges.filter(id => 
    id.includes('sql') || id.includes('injection') || id.includes('database')
  ).length;
  
  const challengeCategories = [
    { name: 'Web Security', completed: 0, total: 12, color: 'from-primary to-primary/50' },
    { name: 'SQL Security', completed: sqlCompleted, total: 5, color: 'from-blue-500 to-blue-400' },
    { name: 'Cryptography', completed: cryptoCompleted, total: 8, color: 'from-purple-500 to-purple-400' },
    { name: 'Network Security', completed: 0, total: 10, color: 'from-orange-500 to-orange-400' },
    { name: 'Forensics', completed: 0, total: 6, color: 'from-red-500 to-red-400' },
  ];

  const KeyIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  );

  const achievements = [
    { name: 'First Steps', description: 'Complete your first challenge', unlocked: completedChallenges.length > 0, icon: Trophy },
    { name: 'Speed Runner', description: 'Complete 5 challenges in one day', unlocked: false, icon: Zap },
    { name: 'Security Expert', description: 'Master all web security challenges', unlocked: false, icon: Shield },
    { name: 'Crypto Master', description: 'Complete all cryptography puzzles', unlocked: cryptoCompleted >= 8, icon: KeyIcon },
    { name: 'SQL Ninja', description: 'Master SQL injection techniques', unlocked: sqlCompleted >= 5, icon: Database },
    { name: 'Elite Hacker', description: 'Reach level 10', unlocked: level >= 10, icon: Star },
  ];

  const username = user?.email?.split('@')[0] || 'Hacker';

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14 md:h-16 md:w-16 border-2 border-primary/50">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback className="bg-primary/20 text-primary text-xl font-cyber">
              {username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl md:text-3xl font-cyber font-bold cyber-glow">
              Welcome, {username}!
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Ready to level up your cybersecurity skills?
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1.5 border-primary/50 text-primary">
            <Flame className="h-4 w-4 mr-1" />
            Level {level}
          </Badge>
          <Badge variant="outline" className="px-3 py-1.5 border-secondary/50">
            <Star className="h-4 w-4 mr-1" />
            {points} XP
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="cyber-bg border-primary/30 hover:border-primary/50 transition-colors">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Points</p>
                <p className="text-2xl md:text-3xl font-cyber font-bold text-primary cyber-glow">{points}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-bg border-primary/30 hover:border-primary/50 transition-colors">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Challenges</p>
                <p className="text-2xl md:text-3xl font-cyber font-bold text-blue-400">{completedChallenges.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Target className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-bg border-primary/30 hover:border-primary/50 transition-colors">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-2xl md:text-3xl font-cyber font-bold text-orange-400">3 days</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Flame className="h-6 w-6 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-bg border-primary/30 hover:border-primary/50 transition-colors">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Achievements</p>
                <p className="text-2xl md:text-3xl font-cyber font-bold text-purple-400">
                  {achievements.filter(a => a.unlocked).length}/{achievements.length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Award className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
          <TabsTrigger value="overview" className="py-2">Overview</TabsTrigger>
          <TabsTrigger value="challenges" className="py-2">Challenges</TabsTrigger>
          <TabsTrigger value="achievements" className="py-2">Achievements</TabsTrigger>
          <TabsTrigger value="tools" className="py-2">Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Challenge Categories */}
            <Card className="cyber-bg border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5 text-primary" />
                  Challenge Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {challengeCategories.map((category) => (
                  <div key={category.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{category.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {category.completed}/{category.total}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${category.color} transition-all duration-500`}
                        style={{ width: `${(category.completed / category.total) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="cyber-bg border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5 text-secondary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      {activity.type === 'challenge' ? (
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <Target className="h-4 w-4 text-primary" />
                        </div>
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                          <Trophy className="h-4 w-4 text-yellow-400" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium">{activity.name}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-primary border-primary/30">
                      +{activity.points} XP
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="challenges">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {challengeCategories.map((category) => (
              <Card key={category.name} className="cyber-bg border-primary/30 hover:border-primary/50 transition-all hover:scale-[1.02]">
                <CardContent className="p-6">
                  <div className={`h-12 w-12 rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center mb-4`}>
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">Progress</span>
                    <span className="text-sm font-medium">{category.completed}/{category.total}</span>
                  </div>
                  <Progress value={(category.completed / category.total) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-3">
                    {Math.round((category.completed / category.total) * 100)}% complete
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="achievements">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <Card 
                key={achievement.name} 
                className={`cyber-bg transition-all ${
                  achievement.unlocked 
                    ? 'border-primary/50 hover:border-primary' 
                    : 'border-border/50 opacity-60'
                }`}
              >
                <CardContent className="p-6 flex items-start gap-4">
                  <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                    achievement.unlocked ? 'bg-primary/20' : 'bg-muted'
                  }`}>
                    <achievement.icon className={`h-6 w-6 ${
                      achievement.unlocked ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{achievement.name}</h3>
                      {achievement.unlocked ? (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      ) : (
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {achievement.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tools">
          <Card className="cyber-bg border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                AI Chatbot Knowledge Base
              </CardTitle>
              <CardDescription>
                Import the cybersecurity question dataset into the AI chatbot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Load 12,663 cybersecurity questions from the cysecbench.csv dataset into the AI chatbot's knowledge base using RAG (Retrieval Augmented Generation).
              </p>
              
              <Button 
                onClick={handleImportData} 
                disabled={isImporting}
                variant="cyber"
                className="w-full sm:w-auto"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing... (This may take a few minutes)
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Import Knowledge Base
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Dashboard;
