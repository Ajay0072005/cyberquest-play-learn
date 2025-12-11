import { cn } from '@/lib/utils';
import {
  Trophy, Key, Shield, Database, Zap, Terminal, Star, Award, Crown, MessageCircle, Lock
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  trophy: Trophy,
  key: Key,
  shield: Shield,
  database: Database,
  zap: Zap,
  terminal: Terminal,
  star: Star,
  award: Award,
  crown: Crown,
  'message-circle': MessageCircle,
};

interface AchievementBadgeProps {
  name: string;
  description: string;
  icon: string;
  points: number;
  earned: boolean;
  earnedAt?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AchievementBadge = ({
  name,
  description,
  icon,
  points,
  earned,
  earnedAt,
  size = 'md',
}: AchievementBadgeProps) => {
  const IconComponent = iconMap[icon] || Trophy;
  
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  };

  const iconSizes = {
    sm: 'h-5 w-5',
    md: 'h-7 w-7',
    lg: 'h-9 w-9',
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'relative rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer',
              sizeClasses[size],
              earned
                ? 'bg-gradient-to-br from-primary/20 to-primary/40 border-2 border-primary shadow-[0_0_15px_rgba(0,255,0,0.3)] hover:shadow-[0_0_25px_rgba(0,255,0,0.5)]'
                : 'bg-muted/50 border-2 border-border/50 opacity-50 grayscale'
            )}
          >
            {earned ? (
              <IconComponent className={cn(iconSizes[size], 'text-primary')} />
            ) : (
              <Lock className={cn(iconSizes[size], 'text-muted-foreground')} />
            )}
            {earned && (
              <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                +{points}
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[200px]">
          <div className="text-center">
            <p className="font-semibold text-foreground">{name}</p>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
            {earned && earnedAt && (
              <p className="text-xs text-primary mt-1">
                Earned {new Date(earnedAt).toLocaleDateString()}
              </p>
            )}
            {!earned && (
              <p className="text-xs text-muted-foreground mt-1 italic">Locked</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
