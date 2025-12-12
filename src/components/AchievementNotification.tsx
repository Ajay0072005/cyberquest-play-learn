import { useEffect, useState } from 'react';
import { Trophy, Sparkles, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AchievementNotificationProps {
  name: string;
  description: string;
  points: number;
  onClose: () => void;
}

export const AchievementNotification = ({
  name,
  description,
  points,
  onClose,
}: AchievementNotificationProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => setIsVisible(true));

    // Auto-close after 4 seconds
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 500);
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-[100] pointer-events-auto',
        'transition-all duration-500 ease-out',
        isVisible && !isExiting
          ? 'translate-x-0 opacity-100 scale-100'
          : 'translate-x-full opacity-0 scale-95'
      )}
    >
      {/* Particle effects */}
      <div className="absolute -inset-4 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <Sparkles
            key={i}
            className={cn(
              'absolute w-4 h-4 text-primary animate-ping',
              'opacity-75'
            )}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.1}s`,
              animationDuration: '1.5s',
            }}
          />
        ))}
      </div>

      {/* Main notification card */}
      <div
        className={cn(
          'relative overflow-hidden rounded-lg border border-primary/50',
          'bg-gradient-to-br from-background via-background to-primary/10',
          'shadow-lg shadow-primary/20',
          'min-w-[320px] max-w-[400px]'
        )}
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 animate-pulse" />

        {/* Content */}
        <div className="relative p-4">
          <div className="flex items-start gap-4">
            {/* Trophy icon with animation */}
            <div className="relative flex-shrink-0">
              <div
                className={cn(
                  'w-14 h-14 rounded-full',
                  'bg-gradient-to-br from-primary to-primary/60',
                  'flex items-center justify-center',
                  'shadow-lg shadow-primary/40',
                  'animate-bounce'
                )}
                style={{ animationDuration: '1s', animationIterationCount: '3' }}
              >
                <Trophy className="w-7 h-7 text-primary-foreground" />
              </div>
              {/* Rotating stars */}
              <Star
                className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400 animate-spin"
                style={{ animationDuration: '2s' }}
              />
            </div>

            {/* Text content */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-primary uppercase tracking-wider mb-1">
                Achievement Unlocked!
              </p>
              <h3 className="text-lg font-bold text-foreground truncate">
                {name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {description}
              </p>
              <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
                +{points} XP
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar animation */}
        <div className="h-1 bg-primary/20">
          <div
            className="h-full bg-primary transition-all duration-[4000ms] ease-linear"
            style={{ width: isVisible && !isExiting ? '0%' : '100%' }}
          />
        </div>
      </div>
    </div>
  );
};
