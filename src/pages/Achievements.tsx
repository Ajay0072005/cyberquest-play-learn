import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AchievementBadge } from '@/components/AchievementBadge';
import { useAchievements } from '@/hooks/useAchievements';
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

  const categories = [
    { id: 'general', label: 'General', color: 'text-primary' },
    { id: 'crypto', label: 'Cryptography', color: 'text-cyan-400' },
    { id: 'sql', label: 'SQL Injection', color: 'text-orange-400' },
    { id: 'terminal', label: 'Terminal', color: 'text-purple-400' },
    { id: 'chat', label: 'CyberBot', color: 'text-blue-400' },
  ];

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
                <div className="flex flex-wrap gap-6">
                  {categoryAchievements.map((achievement) => (
                    <div key={achievement.id} className="flex flex-col items-center gap-2">
                      <AchievementBadge
                        name={achievement.name}
                        description={achievement.description}
                        icon={achievement.icon}
                        points={achievement.points}
                        earned={isAchievementEarned(achievement.id)}
                        earnedAt={getEarnedDate(achievement.id)}
                        size="lg"
                      />
                      <span className="text-xs text-muted-foreground text-center max-w-[80px] truncate">
                        {achievement.name}
                      </span>
                    </div>
                  ))}
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
