import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useAchievementNotification } from '@/components/AchievementNotificationContainer';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  requirement_type: string;
  requirement_value: number;
}

interface GameContextType {
  points: number;
  level: number;
  addPoints: (points: number) => void;
  completedChallenges: string[];
  completeChallenge: (challengeId: string) => void;
  cryptoPuzzlesSolved: number;
  sqlLevelsCompleted: number;
  terminalFlagsFound: number;
  chatMessagesSent: number;
  incrementCryptoPuzzles: () => void;
  incrementSqlLevels: () => void;
  incrementTerminalFlags: () => void;
  incrementChatMessages: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievementIds, setUserAchievementIds] = useState<Set<string>>(new Set());
  const { showAchievement } = useAchievementNotification();

  const [points, setPoints] = useState(() => {
    const saved = localStorage.getItem('cyberquest-points');
    return saved ? parseInt(saved) : 0;
  });

  const [completedChallenges, setCompletedChallenges] = useState<string[]>(() => {
    const saved = localStorage.getItem('cyberquest-completed');
    return saved ? JSON.parse(saved) : [];
  });

  const [cryptoPuzzlesSolved, setCryptoPuzzlesSolved] = useState(() => {
    const saved = localStorage.getItem('cyberquest-crypto');
    return saved ? parseInt(saved) : 0;
  });

  const [sqlLevelsCompleted, setSqlLevelsCompleted] = useState(() => {
    const saved = localStorage.getItem('cyberquest-sql');
    return saved ? parseInt(saved) : 0;
  });

  const [terminalFlagsFound, setTerminalFlagsFound] = useState(() => {
    const saved = localStorage.getItem('cyberquest-terminal');
    return saved ? parseInt(saved) : 0;
  });

  const [chatMessagesSent, setChatMessagesSent] = useState(() => {
    const saved = localStorage.getItem('cyberquest-chat');
    return saved ? parseInt(saved) : 0;
  });

  const level = Math.floor(points / 1000) + 1;

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch achievements and user achievements
  useEffect(() => {
    const fetchAchievements = async () => {
      const { data } = await supabase.from('achievements').select('*');
      if (data) setAchievements(data);

      if (user) {
        const { data: userAchievements } = await supabase
          .from('user_achievements')
          .select('achievement_id')
          .eq('user_id', user.id);
        if (userAchievements) {
          setUserAchievementIds(new Set(userAchievements.map(ua => ua.achievement_id)));
        }
      }
    };
    fetchAchievements();
  }, [user]);

  // Check and award achievements
  const checkAchievements = useCallback(async (type: string, value: number) => {
    if (!user) return;

    const eligible = achievements.filter(
      a => a.requirement_type === type && 
           a.requirement_value <= value && 
           !userAchievementIds.has(a.id)
    );

    for (const achievement of eligible) {
      const { error } = await supabase.from('user_achievements').insert({
        user_id: user.id,
        achievement_id: achievement.id,
      });

      if (!error) {
        setUserAchievementIds(prev => new Set([...prev, achievement.id]));
        showAchievement({
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          points: achievement.points,
        });
      }
    }
  }, [achievements, userAchievementIds, user, showAchievement]);

  // Sync points from database when user logs in
  useEffect(() => {
    const syncPointsFromDB = async () => {
      if (!user) return;

      try {
        const { data } = await supabase
          .from('profiles')
          .select('points')
          .eq('user_id', user.id)
          .maybeSingle();

        if (data && data.points > 0) {
          const localPoints = parseInt(localStorage.getItem('cyberquest-points') || '0');
          const maxPoints = Math.max(data.points, localPoints);
          setPoints(maxPoints);
        }
      } catch (error) {
        console.error('Error syncing points:', error);
      }
    };

    syncPointsFromDB();
  }, [user]);

  // Sync points to database when they change
  useEffect(() => {
    const syncPointsToDB = async () => {
      if (!user || points === 0) return;

      try {
        await supabase
          .from('profiles')
          .update({ points })
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Error saving points to database:', error);
      }
    };

    syncPointsToDB();
  }, [points, user]);

  // Check points-based achievements when points change
  useEffect(() => {
    if (points > 0) {
      checkAchievements('points_earned', points);
    }
  }, [points, checkAchievements]);

  const addPoints = (newPoints: number) => {
    setPoints(prev => prev + newPoints);
  };

  const completeChallenge = (challengeId: string) => {
    if (!completedChallenges.includes(challengeId)) {
      setCompletedChallenges(prev => [...prev, challengeId]);
      addPoints(100);
      checkAchievements('challenges_completed', completedChallenges.length + 1);
    }
  };

  const incrementCryptoPuzzles = useCallback(() => {
    setCryptoPuzzlesSolved(prev => {
      const newVal = prev + 1;
      localStorage.setItem('cyberquest-crypto', newVal.toString());
      checkAchievements('crypto_puzzles', newVal);
      // Check for Crypto Master milestone (all 3 puzzles completed)
      if (newVal >= 3) {
        checkAchievements('crypto_master', 1);
      }
      return newVal;
    });
  }, [checkAchievements]);

  const incrementSqlLevels = useCallback(() => {
    setSqlLevelsCompleted(prev => {
      const newVal = prev + 1;
      localStorage.setItem('cyberquest-sql', newVal.toString());
      checkAchievements('sql_levels', newVal);
      // Check for SQL Master milestone (all 5 levels completed)
      if (newVal >= 5) {
        checkAchievements('sql_master', 1);
      }
      return newVal;
    });
  }, [checkAchievements]);

  const incrementTerminalFlags = useCallback(() => {
    setTerminalFlagsFound(prev => {
      const newVal = prev + 1;
      localStorage.setItem('cyberquest-terminal', newVal.toString());
      if (newVal >= 5) {
        checkAchievements('terminal_complete', 1);
        // Check for Terminal Commander milestone (all 5 objectives completed)
        checkAchievements('terminal_master', 1);
      }
      return newVal;
    });
  }, [checkAchievements]);

  const incrementChatMessages = useCallback(() => {
    setChatMessagesSent(prev => {
      const newVal = prev + 1;
      localStorage.setItem('cyberquest-chat', newVal.toString());
      checkAchievements('chat_messages', newVal);
      return newVal;
    });
  }, [checkAchievements]);

  useEffect(() => {
    localStorage.setItem('cyberquest-points', points.toString());
  }, [points]);

  useEffect(() => {
    localStorage.setItem('cyberquest-completed', JSON.stringify(completedChallenges));
  }, [completedChallenges]);

  return (
    <GameContext.Provider value={{
      points,
      level,
      addPoints,
      completedChallenges,
      completeChallenge,
      cryptoPuzzlesSolved,
      sqlLevelsCompleted,
      terminalFlagsFound,
      chatMessagesSent,
      incrementCryptoPuzzles,
      incrementSqlLevels,
      incrementTerminalFlags,
      incrementChatMessages,
    }}>
      {children}
    </GameContext.Provider>
  );
};
