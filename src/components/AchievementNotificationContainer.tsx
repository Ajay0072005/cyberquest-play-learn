import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AchievementNotification } from './AchievementNotification';

interface Achievement {
  id: string;
  name: string;
  description: string;
  points: number;
}

interface AchievementNotificationContextType {
  showAchievement: (achievement: Achievement) => void;
}

const AchievementNotificationContext = createContext<AchievementNotificationContextType | null>(null);

export const useAchievementNotification = () => {
  const context = useContext(AchievementNotificationContext);
  if (!context) {
    throw new Error('useAchievementNotification must be used within AchievementNotificationProvider');
  }
  return context;
};

export const AchievementNotificationProvider = ({ children }: { children: ReactNode }) => {
  const [queue, setQueue] = useState<Achievement[]>([]);
  const [current, setCurrent] = useState<Achievement | null>(null);

  const showAchievement = useCallback((achievement: Achievement) => {
    if (current) {
      setQueue((prev) => [...prev, achievement]);
    } else {
      setCurrent(achievement);
    }
  }, [current]);

  const handleClose = useCallback(() => {
    setCurrent(null);
    // Show next in queue after a brief delay
    setTimeout(() => {
      setQueue((prev) => {
        if (prev.length > 0) {
          const [next, ...rest] = prev;
          setCurrent(next);
          return rest;
        }
        return prev;
      });
    }, 300);
  }, []);

  return (
    <AchievementNotificationContext.Provider value={{ showAchievement }}>
      {children}
      {current && (
        <AchievementNotification
          name={current.name}
          description={current.description}
          points={current.points}
          onClose={handleClose}
        />
      )}
    </AchievementNotificationContext.Provider>
  );
};
