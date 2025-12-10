import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface GameContextType {
  points: number;
  level: number;
  addPoints: (points: number) => void;
  completedChallenges: string[];
  completeChallenge: (challengeId: string) => void;
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
  const [points, setPoints] = useState(() => {
    const saved = localStorage.getItem('cyberquest-points');
    return saved ? parseInt(saved) : 0;
  });

  const [completedChallenges, setCompletedChallenges] = useState<string[]>(() => {
    const saved = localStorage.getItem('cyberquest-completed');
    return saved ? JSON.parse(saved) : [];
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
          // Use the higher value between local and DB
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

  const addPoints = (newPoints: number) => {
    setPoints(prev => prev + newPoints);
  };

  const completeChallenge = (challengeId: string) => {
    if (!completedChallenges.includes(challengeId)) {
      setCompletedChallenges(prev => [...prev, challengeId]);
      addPoints(100); // Base points for completing a challenge
    }
  };

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
      completeChallenge
    }}>
      {children}
    </GameContext.Provider>
  );
};
