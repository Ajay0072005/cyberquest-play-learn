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
  // New specific completion functions
  completeSqlLevel: (level: number) => Promise<void>;
  completeCryptoPuzzle: (puzzleId: string) => Promise<void>;
  completeTerminalFlag: (flagId: string) => Promise<void>;
  // Check if specific items are completed
  isSqlLevelCompleted: (level: number) => boolean;
  isCryptoPuzzleCompleted: (puzzleId: string) => boolean;
  isTerminalFlagCompleted: (flagId: string) => boolean;
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

  // Track specific completed items
  const [completedSqlLevels, setCompletedSqlLevels] = useState<Set<number>>(new Set());
  const [completedCryptoPuzzles, setCompletedCryptoPuzzles] = useState<Set<string>>(new Set());
  const [completedTerminalFlags, setCompletedTerminalFlags] = useState<Set<string>>(new Set());

  const [points, setPoints] = useState(() => {
    const saved = localStorage.getItem('cyberquest-points');
    return saved ? parseInt(saved) : 0;
  });

  const [completedChallenges, setCompletedChallenges] = useState<string[]>(() => {
    const saved = localStorage.getItem('cyberquest-completed');
    return saved ? JSON.parse(saved) : [];
  });

  const [chatMessagesSent, setChatMessagesSent] = useState(() => {
    const saved = localStorage.getItem('cyberquest-chat');
    return saved ? parseInt(saved) : 0;
  });

  // Derived counts from sets
  const sqlLevelsCompleted = completedSqlLevels.size;
  const cryptoPuzzlesSolved = completedCryptoPuzzles.size;
  const terminalFlagsFound = completedTerminalFlags.size;

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

  // Fetch game progress from database
  useEffect(() => {
    const fetchGameProgress = async () => {
      if (!user) {
        // Load from localStorage for non-logged users
        const savedSql = localStorage.getItem('cyberquest-sql-levels');
        const savedCrypto = localStorage.getItem('cyberquest-crypto-puzzles');
        const savedTerminal = localStorage.getItem('cyberquest-terminal-flags');
        
        if (savedSql) setCompletedSqlLevels(new Set(JSON.parse(savedSql)));
        if (savedCrypto) setCompletedCryptoPuzzles(new Set(JSON.parse(savedCrypto)));
        if (savedTerminal) setCompletedTerminalFlags(new Set(JSON.parse(savedTerminal)));
        return;
      }

      try {
        const { data, error } = await supabase
          .from('lab_progress')
          .select('lab_id, lab_type')
          .eq('user_id', user.id)
          .in('lab_type', ['sql_level', 'crypto_puzzle', 'terminal_flag']);

        if (error) throw error;

        const sqlLevels = new Set<number>();
        const cryptoPuzzles = new Set<string>();
        const terminalFlags = new Set<string>();

        data?.forEach(item => {
          if (item.lab_type === 'sql_level') {
            const level = parseInt(item.lab_id.replace('sql-', ''));
            if (!isNaN(level)) sqlLevels.add(level);
          } else if (item.lab_type === 'crypto_puzzle') {
            cryptoPuzzles.add(item.lab_id);
          } else if (item.lab_type === 'terminal_flag') {
            terminalFlags.add(item.lab_id);
          }
        });

        setCompletedSqlLevels(sqlLevels);
        setCompletedCryptoPuzzles(cryptoPuzzles);
        setCompletedTerminalFlags(terminalFlags);

        // Also save to localStorage as backup
        localStorage.setItem('cyberquest-sql-levels', JSON.stringify([...sqlLevels]));
        localStorage.setItem('cyberquest-crypto-puzzles', JSON.stringify([...cryptoPuzzles]));
        localStorage.setItem('cyberquest-terminal-flags', JSON.stringify([...terminalFlags]));
      } catch (error) {
        console.error('Error fetching game progress:', error);
      }
    };

    fetchGameProgress();
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

  // Complete specific SQL level
  const completeSqlLevel = useCallback(async (level: number) => {
    if (completedSqlLevels.has(level)) return;

    const newCompleted = new Set([...completedSqlLevels, level]);
    setCompletedSqlLevels(newCompleted);
    localStorage.setItem('cyberquest-sql-levels', JSON.stringify([...newCompleted]));

    if (user) {
      try {
        await supabase.from('lab_progress').insert({
          user_id: user.id,
          lab_id: `sql-${level}`,
          lab_type: 'sql_level',
          points_earned: 100,
        });
      } catch (error: any) {
        if (error?.code !== '23505') {
          console.error('Error saving SQL level progress:', error);
        }
      }
    }

    addPoints(100);
    checkAchievements('sql_levels', newCompleted.size);
    if (newCompleted.size >= 5) {
      checkAchievements('sql_master', 1);
    }
  }, [completedSqlLevels, user, checkAchievements]);

  // Complete specific crypto puzzle
  const completeCryptoPuzzle = useCallback(async (puzzleId: string) => {
    if (completedCryptoPuzzles.has(puzzleId)) return;

    const newCompleted = new Set([...completedCryptoPuzzles, puzzleId]);
    setCompletedCryptoPuzzles(newCompleted);
    localStorage.setItem('cyberquest-crypto-puzzles', JSON.stringify([...newCompleted]));

    if (user) {
      try {
        await supabase.from('lab_progress').insert({
          user_id: user.id,
          lab_id: puzzleId,
          lab_type: 'crypto_puzzle',
          points_earned: 150,
        });
      } catch (error: any) {
        if (error?.code !== '23505') {
          console.error('Error saving crypto puzzle progress:', error);
        }
      }
    }

    addPoints(150);
    checkAchievements('crypto_puzzles', newCompleted.size);
    if (newCompleted.size >= 3) {
      checkAchievements('crypto_master', 1);
    }
  }, [completedCryptoPuzzles, user, checkAchievements]);

  // Complete specific terminal flag
  const completeTerminalFlag = useCallback(async (flagId: string) => {
    if (completedTerminalFlags.has(flagId)) return;

    const newCompleted = new Set([...completedTerminalFlags, flagId]);
    setCompletedTerminalFlags(newCompleted);
    localStorage.setItem('cyberquest-terminal-flags', JSON.stringify([...newCompleted]));

    if (user) {
      try {
        await supabase.from('lab_progress').insert({
          user_id: user.id,
          lab_id: flagId,
          lab_type: 'terminal_flag',
          points_earned: 50,
        });
      } catch (error: any) {
        if (error?.code !== '23505') {
          console.error('Error saving terminal flag progress:', error);
        }
      }
    }

    addPoints(50);
    if (newCompleted.size >= 5) {
      checkAchievements('terminal_complete', 1);
      checkAchievements('terminal_master', 1);
    }
  }, [completedTerminalFlags, user, checkAchievements]);

  // Check functions
  const isSqlLevelCompleted = useCallback((level: number) => completedSqlLevels.has(level), [completedSqlLevels]);
  const isCryptoPuzzleCompleted = useCallback((puzzleId: string) => completedCryptoPuzzles.has(puzzleId), [completedCryptoPuzzles]);
  const isTerminalFlagCompleted = useCallback((flagId: string) => completedTerminalFlags.has(flagId), [completedTerminalFlags]);

  // Legacy increment functions (for backwards compatibility)
  const incrementCryptoPuzzles = useCallback(() => {
    const nextPuzzleId = `crypto-${completedCryptoPuzzles.size + 1}`;
    completeCryptoPuzzle(nextPuzzleId);
  }, [completedCryptoPuzzles, completeCryptoPuzzle]);

  const incrementSqlLevels = useCallback(() => {
    const nextLevel = completedSqlLevels.size + 1;
    completeSqlLevel(nextLevel);
  }, [completedSqlLevels, completeSqlLevel]);

  const incrementTerminalFlags = useCallback(() => {
    const nextFlagId = `terminal-${completedTerminalFlags.size + 1}`;
    completeTerminalFlag(nextFlagId);
  }, [completedTerminalFlags, completeTerminalFlag]);

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
      completeSqlLevel,
      completeCryptoPuzzle,
      completeTerminalFlag,
      isSqlLevelCompleted,
      isCryptoPuzzleCompleted,
      isTerminalFlagCompleted,
    }}>
      {children}
    </GameContext.Provider>
  );
};
