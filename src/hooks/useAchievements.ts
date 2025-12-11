import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  category: string;
  requirement_type: string;
  requirement_value: number;
}

interface UserAchievement {
  id: string;
  achievement_id: string;
  earned_at: string;
}

export const useAchievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);

      const { data: achievementsData } = await supabase
        .from('achievements')
        .select('*')
        .order('points', { ascending: true });

      if (achievementsData) {
        setAchievements(achievementsData);
      }

      if (user) {
        const { data: userAchievementsData } = await supabase
          .from('user_achievements')
          .select('*')
          .eq('user_id', user.id);

        if (userAchievementsData) {
          setUserAchievements(userAchievementsData);
        }
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const checkAndAwardAchievement = useCallback(async (
    requirementType: string,
    currentValue: number
  ) => {
    if (!userId) return;

    const eligibleAchievements = achievements.filter(
      (a) =>
        a.requirement_type === requirementType &&
        a.requirement_value <= currentValue &&
        !userAchievements.some((ua) => ua.achievement_id === a.id)
    );

    for (const achievement of eligibleAchievements) {
      const { error } = await supabase.from('user_achievements').insert({
        user_id: userId,
        achievement_id: achievement.id,
      });

      if (!error) {
        setUserAchievements((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            achievement_id: achievement.id,
            earned_at: new Date().toISOString(),
          },
        ]);

        toast({
          title: '🏆 Achievement Unlocked!',
          description: `${achievement.name} - ${achievement.description}`,
        });
      }
    }
  }, [achievements, userAchievements, userId, toast]);

  const isAchievementEarned = useCallback(
    (achievementId: string) => userAchievements.some((ua) => ua.achievement_id === achievementId),
    [userAchievements]
  );

  const getEarnedDate = useCallback(
    (achievementId: string) => {
      const ua = userAchievements.find((ua) => ua.achievement_id === achievementId);
      return ua?.earned_at;
    },
    [userAchievements]
  );

  const earnedCount = userAchievements.length;
  const totalCount = achievements.length;

  return {
    achievements,
    userAchievements,
    loading,
    checkAndAwardAchievement,
    isAchievementEarned,
    getEarnedDate,
    earnedCount,
    totalCount,
  };
};
