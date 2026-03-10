import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Trophy } from 'lucide-react';
import { useGame } from '@/context/GameContext';

export const PointsDisplay: React.FC = () => {
  const { points, level } = useGame();
  
  const pointsToNextLevel = (level * 1000) - points;
  const progress = ((points % 1000) / 1000) * 100;

  return (
    <Card className="border-border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <span className="text-lg font-semibold text-foreground">
              {points.toLocaleString()} XP
            </span>
          </div>
          <Badge variant="outline" className="border-border text-foreground">
            <Trophy className="h-3 w-3 mr-1" />
            Level {level}
          </Badge>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress to Level {level + 1}</span>
            <span>{pointsToNextLevel} XP needed</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};