import React from 'react';
import { Navigation } from '@/components/Navigation';
import { PointsDisplay } from '@/components/PointsDisplay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Trophy, 
  Target, 
  Clock, 
  Zap, 
  Shield, 
  Lock,
  CheckCircle,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { useGame } from '@/context/GameContext';

const Dashboard: React.FC = () => {
  const { points, level, completedChallenges } = useGame();

  const recentActivity = [
    { type: 'challenge', name: 'SQL Injection Basics', points: 150, time: '2 hours ago' },
    { type: 'achievement', name: 'First Blood', points: 50, time: '1 day ago' },
    { type: 'challenge', name: 'Caesar Cipher', points: 100, time: '2 days ago' },
  ];

  const challengeCategories = [
    { name: 'Web Security', completed: 5, total: 12, color: 'text-primary' },
    { name: 'Cryptography', completed: 3, total: 8, color: 'text-secondary' },
    { name: 'Network Security', completed: 2, total: 10, color: 'text-accent' },
    { name: 'Forensics', completed: 1, total: 6, color: 'text-destructive' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-8">
        <div className="flex items-center gap-4 mb-8">
          <Avatar className="h-16 w-16">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback className="bg-primary/20 text-primary text-xl">
              CQ
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-cyber font-bold cyber-glow">Welcome back, Hacker!</h1>
            <p className="text-muted-foreground">Ready to level up your cybersecurity skills?</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <PointsDisplay />
          </div>
          
          <Card className="cyber-bg border-primary/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5 text-primary" />
                Challenges Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-cyber font-bold text-primary cyber-glow mb-2">
                {completedChallenges.length}
              </div>
              <p className="text-sm text-muted-foreground">Keep pushing your limits!</p>
            </CardContent>
          </Card>

          <Card className="cyber-bg border-primary/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-secondary" />
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-cyber font-bold text-secondary mb-2">
                +{points > 500 ? Math.floor(points * 0.3) : points} XP
              </div>
              <p className="text-sm text-muted-foreground">Great progress!</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="cyber-bg border-primary/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Challenge Categories
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
                      <Progress 
                        value={(category.completed / category.total) * 100} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="cyber-bg border-primary/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-secondary" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        {activity.type === 'challenge' ? (
                          <Target className="h-4 w-4 text-primary" />
                        ) : (
                          <Trophy className="h-4 w-4 text-accent" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{activity.name}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-primary">
                        +{activity.points} XP
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="challenges">
            <Card className="cyber-bg border-primary/30">
              <CardHeader>
                <CardTitle>Challenge Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {challengeCategories.map((category) => (
                    <Card key={category.name} className="cyber-bg border-border/50">
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">{category.name}</h3>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Progress</span>
                          <span className="text-sm">{category.completed}/{category.total}</span>
                        </div>
                        <Progress value={(category.completed / category.total) * 100} className="h-2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements">
            <Card className="cyber-bg border-primary/30">
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg border border-primary/30">
                    <Trophy className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-semibold">First Steps</h3>
                      <p className="text-sm text-muted-foreground">Complete your first challenge</p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-primary ml-auto" />
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-muted/20 rounded-lg border border-border/50 opacity-60">
                    <Zap className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <h3 className="font-semibold">Speed Runner</h3>
                      <p className="text-sm text-muted-foreground">Complete 5 challenges in one day</p>
                    </div>
                    <Lock className="h-5 w-5 text-muted-foreground ml-auto" />
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-muted/20 rounded-lg border border-border/50 opacity-60">
                    <Shield className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <h3 className="font-semibold">Security Expert</h3>
                      <p className="text-sm text-muted-foreground">Master all web security challenges</p>
                    </div>
                    <Lock className="h-5 w-5 text-muted-foreground ml-auto" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card className="cyber-bg border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Activity Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-muted/10 rounded-lg">
                      <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{activity.name}</h3>
                          <Badge variant="outline">+{activity.points} XP</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;