import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { SkillMatrix } from '@/components/SkillMatrix';
import { PointsDisplay } from '@/components/PointsDisplay';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Trophy, Target, Clock, Zap, Shield, Lock, CheckCircle, TrendingUp, Calendar, Download, Flame, Star, Award, ChevronRight, Gamepad2,
  Globe, Terminal as TerminalIcon, Search, Network, Bug, Eye, Key, Wifi, ShieldCheck, FileCode, Database,
  BookOpen
} from 'lucide-react';
import { useGame } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AchievementBadge } from '@/components/AchievementBadge';
import { useNavigate } from 'react-router-dom';

const securityTools = [
  { name: 'Nmap', description: 'Network discovery and security auditing tool', url: 'https://nmap.org/download', icon: Network, category: 'Network Scanning', color: 'bg-blue-500/20 text-blue-400', learn: 'https://www.youtube.com/watch?v=4t4kBkMsDbQ', learnLabel: 'Nmap Tutorial for Beginners' },
  { name: 'Wireshark', description: 'Network protocol analyzer for traffic inspection', url: 'https://www.wireshark.org/download.html', icon: Eye, category: 'Packet Analysis', color: 'bg-cyan-500/20 text-cyan-400', learn: 'https://www.youtube.com/watch?v=lb1Dw0elw0Q', learnLabel: 'Wireshark Crash Course' },
  { name: 'Burp Suite', description: 'Web application security testing platform', url: 'https://portswigger.net/burp/communitydownload', icon: Bug, category: 'Web Security', color: 'bg-orange-500/20 text-orange-400', learn: 'https://portswigger.net/web-security', learnLabel: 'PortSwigger Web Security Academy' },
  { name: 'Metasploit', description: 'Penetration testing framework', url: 'https://www.metasploit.com/download', icon: ShieldCheck, category: 'Pen Testing', color: 'bg-red-500/20 text-red-400', learn: 'https://www.youtube.com/watch?v=8lR27r8Y_ik', learnLabel: 'Metasploit for Beginners' },
  { name: 'Kali Linux', description: 'Debian-based Linux distro for security testing', url: 'https://www.kali.org/get-kali/', icon: TerminalIcon, category: 'Operating System', color: 'bg-indigo-500/20 text-indigo-400', learn: 'https://www.kali.org/docs/', learnLabel: 'Kali Linux Documentation' },
  { name: 'John the Ripper', description: 'Fast password cracker for multiple platforms', url: 'https://www.openwall.com/john/', icon: Key, category: 'Password Cracking', color: 'bg-yellow-500/20 text-yellow-400', learn: 'https://www.youtube.com/watch?v=XjVYl1Ts6XI', learnLabel: 'John the Ripper Tutorial' },
  { name: 'Aircrack-ng', description: 'WiFi network security assessment tools', url: 'https://www.aircrack-ng.org/downloads.html', icon: Wifi, category: 'Wireless Security', color: 'bg-green-500/20 text-green-400', learn: 'https://www.aircrack-ng.org/doku.php?id=getting_started', learnLabel: 'Aircrack-ng Getting Started' },
  { name: 'OWASP ZAP', description: 'Open-source web app security scanner', url: 'https://www.zaproxy.org/download/', icon: Search, category: 'Web Security', color: 'bg-purple-500/20 text-purple-400', learn: 'https://www.zaproxy.org/getting-started/', learnLabel: 'ZAP Getting Started Guide' },
  { name: 'Hashcat', description: 'Advanced password recovery and hash cracking', url: 'https://hashcat.net/hashcat/', icon: FileCode, category: 'Password Cracking', color: 'bg-pink-500/20 text-pink-400', learn: 'https://hashcat.net/wiki/', learnLabel: 'Hashcat Wiki & Docs' },
  { name: 'Ghidra', description: 'NSA reverse engineering framework', url: 'https://ghidra-sre.org/', icon: Globe, category: 'Reverse Engineering', color: 'bg-emerald-500/20 text-emerald-400', learn: 'https://www.youtube.com/watch?v=fTGTnrgjuGA', learnLabel: 'Ghidra RE Tutorial' },
  { name: 'Nikto', description: 'Web server vulnerability scanner', url: 'https://github.com/sullo/nikto', icon: Shield, category: 'Web Scanning', color: 'bg-amber-500/20 text-amber-400', learn: 'https://www.youtube.com/watch?v=K78YOmbuT48', learnLabel: 'Nikto Scanner Tutorial' },
  { name: 'Maltego', description: 'Open-source intelligence and forensics tool', url: 'https://www.maltego.com/downloads/', icon: Globe, category: 'OSINT', color: 'bg-teal-500/20 text-teal-400', learn: 'https://www.youtube.com/watch?v=sP-Pl_SRQVo', learnLabel: 'Maltego OSINT Guide' },
];

interface RecentAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  earned_at: string;
}

const Dashboard: React.FC = () => {
  const { points, level, completedChallenges, cryptoPuzzlesSolved, sqlLevelsCompleted, terminalFlagsFound, chatMessagesSent } = useGame();
  const { user } = useAuth();
  const { toast } = useToast();

  const [recentAchievements, setRecentAchievements] = useState<RecentAchievement[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const navigate = useNavigate();

  // Calculate login streak
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const savedDays: string[] = JSON.parse(localStorage.getItem('cyberquest-login-days') || '[]');

    if (!savedDays.includes(today)) {
      savedDays.push(today);
      localStorage.setItem('cyberquest-login-days', JSON.stringify(savedDays));
    }

    // Calculate streak from sorted unique days
    const sorted = [...new Set(savedDays)].sort().reverse();
    let streak = 1;
    for (let i = 0; i < sorted.length - 1; i++) {
      const curr = new Date(sorted[i]);
      const prev = new Date(sorted[i + 1]);
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        streak++;
      } else {
        break;
      }
    }
    setCurrentStreak(streak);
  }, []);

  // Fetch recently earned achievements
  useEffect(() => {
    const fetchRecentAchievements = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          id,
          earned_at,
          achievement_id,
          achievements (
            id,
            name,
            description,
            icon,
            points
          )
        `)
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false })
        .limit(5);

      if (data && !error) {
        const formatted = data.map((ua: any) => ({
          id: ua.achievements.id,
          name: ua.achievements.name,
          description: ua.achievements.description,
          icon: ua.achievements.icon,
          points: ua.achievements.points,
          earned_at: ua.earned_at,
        }));
        setRecentAchievements(formatted);
      }
    };

    fetchRecentAchievements();
  }, [user]);


  // Get Sherlock course progress from localStorage
  const sherlockProgress = JSON.parse(localStorage.getItem('sherlock-progress') || '{}');
  const sherlockModulesCompleted = Object.values(sherlockProgress).filter(Boolean).length;
  const sherlockEscapeRoomCompleted = localStorage.getItem('sherlock-escape-completed') === 'true';

  // Build dynamic recent activity based on actual user actions
  const recentActivity = [];
  if (sqlLevelsCompleted > 0) {
    recentActivity.push({ type: 'challenge', name: `SQL Level ${sqlLevelsCompleted} Completed`, points: 50, time: 'Recently' });
  }
  if (cryptoPuzzlesSolved > 0) {
    recentActivity.push({ type: 'challenge', name: `${cryptoPuzzlesSolved} Crypto Puzzle${cryptoPuzzlesSolved > 1 ? 's' : ''} Solved`, points: cryptoPuzzlesSolved * 75, time: 'Recently' });
  }
  if (terminalFlagsFound > 0) {
    recentActivity.push({ type: 'challenge', name: `${terminalFlagsFound} Terminal Flag${terminalFlagsFound > 1 ? 's' : ''} Found`, points: terminalFlagsFound * 50, time: 'Recently' });
  }
  if (chatMessagesSent > 0) {
    recentActivity.push({ type: 'activity', name: `${chatMessagesSent} AI Chat Message${chatMessagesSent > 1 ? 's' : ''} Sent`, points: chatMessagesSent * 5, time: 'Recently' });
  }
  if (sherlockModulesCompleted > 0) {
    recentActivity.push({ type: 'challenge', name: `Sherlock Module ${sherlockModulesCompleted}/3 Completed`, points: sherlockModulesCompleted * 100, time: 'Recently' });
  }
  if (recentActivity.length === 0) {
    recentActivity.push({ type: 'info', name: 'No activity yet', points: 0, time: 'Start exploring!' });
  }
  
  const challengeCategories = [
    { name: 'SQL Injection', completed: sqlLevelsCompleted, total: 5, color: 'from-blue-500 to-blue-400' },
    { name: 'Cryptography', completed: cryptoPuzzlesSolved, total: 3, color: 'from-purple-500 to-purple-400' },
    { name: 'Terminal Security', completed: terminalFlagsFound, total: 5, color: 'from-orange-500 to-orange-400' },
    { name: 'Sherlock Course', completed: sherlockModulesCompleted + (sherlockEscapeRoomCompleted ? 1 : 0), total: 4, color: 'from-amber-500 to-amber-400' },
  ];

  const KeyIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  );

  const totalChallengesCompleted = sqlLevelsCompleted + cryptoPuzzlesSolved + terminalFlagsFound + sherlockModulesCompleted;

  const achievements = [
    { name: 'First Steps', description: 'Complete your first challenge', unlocked: totalChallengesCompleted > 0, icon: Trophy },
    { name: 'Crypto Master', description: 'Complete all cryptography puzzles', unlocked: cryptoPuzzlesSolved >= 3, icon: KeyIcon },
    { name: 'SQL Ninja', description: 'Master all SQL injection levels', unlocked: sqlLevelsCompleted >= 5, icon: Database },
    { name: 'Terminal Commander', description: 'Find all terminal flags', unlocked: terminalFlagsFound >= 5, icon: Shield },
    { name: 'Detective', description: 'Complete Sherlock Holmes course', unlocked: sherlockModulesCompleted >= 3 && sherlockEscapeRoomCompleted, icon: Star },
    { name: 'Elite Hacker', description: 'Reach level 10', unlocked: level >= 10, icon: Zap },
  ];

  const username = user?.email?.split('@')[0] || 'Hacker';

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14 md:h-16 md:w-16 border-2 border-border">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
              {username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Welcome back, {username}
            </h1>
            <p className="text-muted-foreground text-sm">
              Ready to level up your cybersecurity skills?
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1.5 border-border text-foreground">
            <Flame className="h-4 w-4 mr-1 text-primary" />
            Level {level}
          </Badge>
          <Badge variant="outline" className="px-3 py-1.5 border-border text-foreground">
            <Star className="h-4 w-4 mr-1 text-primary" />
            {points} XP
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-border hover:border-primary/40 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total XP</p>
                <p className="text-2xl font-bold text-foreground">{points.toLocaleString()}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border hover:border-primary/40 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Challenges</p>
                <p className="text-2xl font-bold text-foreground">{totalChallengesCompleted}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border hover:border-primary/40 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Current Streak</p>
                <p className="text-2xl font-bold text-foreground">{currentStreak} day{currentStreak !== 1 ? 's' : ''}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Flame className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border hover:border-primary/40 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Achievements</p>
                <p className="text-2xl font-bold text-foreground">
                  {achievements.filter(a => a.unlocked).length}/{achievements.length}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Award className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CyberQuest 3D Banner */}
      <Card className="mb-8 border-border bg-card overflow-hidden hover:border-primary/40 transition-colors cursor-pointer group" onClick={() => navigate('/cyber-game')}>
        <CardContent className="p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Gamepad2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Play CyberQuest 3D</h3>
              <p className="text-sm text-muted-foreground">Explore a cyber city and solve 5 security missions</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
        </CardContent>
      </Card>

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
            <Card className="border-border">
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

            {/* Recently Unlocked Achievements */}
            <Card className="border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Trophy className="h-5 w-5 text-yellow-400" />
                    Recently Unlocked
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate('/achievements')}
                    className="text-muted-foreground hover:text-primary"
                  >
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recentAchievements.length > 0 ? (
                  <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                    {recentAchievements.map((achievement) => (
                      <AchievementBadge
                        key={achievement.id}
                        name={achievement.name}
                        description={achievement.description}
                        icon={achievement.icon}
                        points={achievement.points}
                        earned={true}
                        earnedAt={achievement.earned_at}
                        size="lg"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No achievements unlocked yet</p>
                    <p className="text-xs mt-1">Complete challenges to earn badges!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-border">
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

          {/* Skill Matrix */}
          <SkillMatrix />
        </TabsContent>

        <TabsContent value="challenges">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {challengeCategories.map((category) => (
              <Card key={category.name} className="border-border hover:border-primary/40 transition-colors">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
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

        <TabsContent value="tools" className="space-y-6">
          {/* Beginner Toolkit Recommendation */}
          <Card className="cyber-bg border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                {level <= 3 ? 'Beginner' : level <= 7 ? 'Intermediate' : 'Advanced'} Toolkit
              </CardTitle>
              <CardDescription>
                Recommended tools for your current skill level (Level {level})
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(() => {
                const toolkits: Record<string, { tools: string[]; tip: string }> = {
                  beginner: {
                    tools: ['Wireshark', 'Nmap', 'Kali Linux', 'OWASP ZAP'],
                    tip: 'Start by learning to analyze network traffic with Wireshark, then explore scanning with Nmap. Kali Linux gives you a full security lab out of the box.',
                  },
                  intermediate: {
                    tools: ['Burp Suite', 'Nmap', 'Nikto', 'John the Ripper', 'Aircrack-ng'],
                    tip: 'Focus on web application testing with Burp Suite and Nikto. Practice password cracking techniques ethically with John the Ripper.',
                  },
                  advanced: {
                    tools: ['Metasploit', 'Ghidra', 'Hashcat', 'Maltego', 'Burp Suite'],
                    tip: 'Master exploitation frameworks with Metasploit, reverse engineering with Ghidra, and OSINT gathering with Maltego.',
                  },
                };
                const tier = level <= 3 ? 'beginner' : level <= 7 ? 'intermediate' : 'advanced';
                const kit = toolkits[tier];
                const recommended = securityTools.filter(t => kit.tools.includes(t.name));

                return (
                  <>
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">💡 Pro Tip:</span> {kit.tip}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {recommended.map((tool, i) => (
                        <a
                          key={tool.name}
                          href={tool.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-3 p-3 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all"
                        >
                          <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary/20 text-primary font-bold text-sm shrink-0">
                            {i + 1}
                          </div>
                          <div className={`h-8 w-8 rounded-md flex items-center justify-center shrink-0 ${tool.color}`}>
                            <tool.icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold group-hover:text-primary transition-colors">{tool.name}</h4>
                            <p className="text-[11px] text-muted-foreground truncate">{tool.description}</p>
                            <a
                              href={tool.learn}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 mt-1 text-[11px] text-primary hover:underline"
                            >
                              <BookOpen className="h-3 w-3" />
                              {tool.learnLabel}
                            </a>
                          </div>
                          <Download className="h-4 w-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      ))}
                    </div>
                  </>
                );
              })()}
            </CardContent>
          </Card>

          {/* Security Tools Downloads */}
          <Card className="cyber-bg border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-primary" />
                Security Tools & Downloads
              </CardTitle>
              <CardDescription>
                Essential cybersecurity tools used by professionals worldwide
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {securityTools.map((tool) => (
                  <a
                    key={tool.name}
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-3 p-4 rounded-lg border border-border/50 bg-muted/10 hover:border-primary/50 hover:bg-primary/5 transition-all"
                  >
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${tool.color}`}>
                      <tool.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold group-hover:text-primary transition-colors">{tool.name}</h4>
                        <Download className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{tool.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant="outline" className="text-[10px]">{tool.category}</Badge>
                        <a
                          href={tool.learn}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline"
                        >
                          <BookOpen className="h-3 w-3" />
                          Learn
                        </a>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Dashboard;
