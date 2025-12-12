import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AchievementBadge } from '@/components/AchievementBadge';
import { useAchievements } from '@/hooks/useAchievements';
import { useGame } from '@/context/GameContext';
import { Trophy, Loader2 } from 'lucide-react';

const Achievements = () => {
  const {
    achievements,
    loading,
    isAchievementEarned,
    getEarnedDate,
    earnedCount,
    totalCount,
  } = useAchievements();

  const { points, cryptoPuzzlesSolved, sqlLevelsCompleted, terminalFlagsFound, chatMessagesSent } = useGame();

  const categories = [
    { id: 'general', label: 'General', color: 'text-primary' },
    { id: 'crypto', label: 'Cryptography', color: 'text-cyan-400' },
    { id: 'sql', label: 'SQL Injection', color: 'text-orange-400' },
    { id: 'terminal', label: 'Terminal', color: 'text-purple-400' },
    { id: 'chat', label: 'CyberBot', color: 'text-blue-400' },
  ];

  // Get current value for each requirement type
  const getCurrentValue = (requirementType: string): number => {
    switch (requirementType) {
      case 'points_earned':
        return points;
      case 'crypto_puzzles':
        return cryptoPuzzlesSolved;
      case 'sql_levels':
        return sqlLevelsCompleted;
      case 'terminal_complete':
        return terminalFlagsFound >= 5 ? 1 : 0;
      case 'chat_messages':
        return chatMessagesSent;
      default:
        return 0;
    }
  };

  // Calculate progress percentage
  const getProgress = (requirementType: string, requirementValue: number): number => {
    const current = getCurrentValue(requirementType);
    return Math.min((current / requirementValue) * 100, 100);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const progressPercent = totalCount > 0 ? (earnedCount / totalCount) * 100 : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            Achievements
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your progress and unlock badges
          </p>
        </div>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Overall Progress</span>
              <span className="text-sm font-medium text-foreground">
                {earnedCount} / {totalCount} achievements
              </span>
            </div>
            <Progress value={progressPercent} className="h-3" />
          </CardContent>
        </Card>

        {categories.map((category) => {
          const categoryAchievements = achievements.filter(
            (a) => a.category === category.id
          );
          if (categoryAchievements.length === 0) return null;

          return (
            <Card key={category.id} className="bg-card border-border">
              <CardHeader className="pb-4">
                <CardTitle className={`text-lg ${category.color}`}>
                  {category.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {categoryAchievements.map((achievement) => {
                    const earned = isAchievementEarned(achievement.id);
                    const progress = getProgress(achievement.requirement_type, achievement.requirement_value);
                    const currentVal = getCurrentValue(achievement.requirement_type);

                    return (
                      <div
                        key={achievement.id}
                        className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                          earned
                            ? 'bg-primary/5 border-primary/30'
                            : 'bg-muted/20 border-border'
                        }`}
                      >
                        <AchievementBadge
                          name={achievement.name}
                          description={achievement.description}
                          icon={achievement.icon}
                          points={achievement.points}
                          earned={earned}
                          earnedAt={getEarnedDate(achievement.id)}
                          size="md"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className={`font-medium truncate ${earned ? 'text-primary' : 'text-foreground'}`}>
                              {achievement.name}
                            </h3>
                            <span className="text-xs text-primary ml-2 flex-shrink-0">
                              +{achievement.points} XP
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                            {achievement.description}
                          </p>
                          {!earned ? (
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Progress</span>
                                <span className="text-foreground">
                                  {currentVal} / {achievement.requirement_value}
                                </span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-primary/60 to-primary transition-all duration-500"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs text-primary/80">
                              ✓ Unlocked {getEarnedDate(achievement.id) 
                                ? new Date(getEarnedDate(achievement.id)!).toLocaleDateString() 
                                : ''}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </DashboardLayout>
  );
};

export default Achievements;
