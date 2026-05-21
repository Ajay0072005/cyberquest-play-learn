import { Eye, CheckSquare, MessageCircle, Star } from 'lucide-react';

interface Stat {
  label: string;
  value: number;
  delta?: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface CommunityStatsProps {
  views?: number;
  solutions?: number;
  discuss?: number;
  reputation?: number;
}

export const CommunityStats = ({ views = 0, solutions = 0, discuss = 0, reputation = 0 }: CommunityStatsProps) => {
  const stats: Stat[] = [
    { label: 'Views', value: views, icon: Eye, color: 'text-sky-500' },
    { label: 'Solutions', value: solutions, icon: CheckSquare, color: 'text-primary' },
    { label: 'Discuss', value: discuss, icon: MessageCircle, color: 'text-orange-500' },
    { label: 'Reputation', value: reputation, icon: Star, color: 'text-amber-500' },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Community Stats</h3>
      <ul className="space-y-2.5">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <li key={s.label} className="text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-foreground">
                  <Icon className={`h-4 w-4 ${s.color}`} />
                  {s.label}
                </span>
                <span className="font-semibold text-foreground">{s.value}</span>
              </div>
              <div className="text-xs text-muted-foreground pl-6 mt-0.5">Last week 0</div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
