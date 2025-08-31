import React, { createContext, useContext, useState, useEffect } from 'react';

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
  const [points, setPoints] = useState(() => {
    const saved = localStorage.getItem('cyberquest-points');
    return saved ? parseInt(saved) : 0;
  });

  const [completedChallenges, setCompletedChallenges] = useState<string[]>(() => {
    const saved = localStorage.getItem('cyberquest-completed');
    return saved ? JSON.parse(saved) : [];
  });

  const level = Math.floor(points / 1000) + 1;

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