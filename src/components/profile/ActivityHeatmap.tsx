import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { BarChart3, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const getColor = (count: number) => {
  if (count === 0) return 'bg-secondary/40';
  if (count === 1) return 'bg-amber-400';
  if (count === 2) return 'bg-cyan-400';
  return 'bg-primary';
};

const getColorLabel = (count: number) => {
  if (count === 0) return 'No activity';
  if (count === 1) return '1 event';
  if (count === 2) return '2 events';
  return `${count} events`;
};

interface DayData {
  date: string;
  count: number;
}

const ActivityHeatmap = () => {
  const { user } = useAuth();
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [activityMap, setActivityMap] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchActivity = async () => {
      if (!user) return;
      setLoading(true);

      const startDate = `${year}-01-01T00:00:00Z`;
      const endDate = `${year}-12-31T23:59:59Z`;

      try {
        const [labRes, achieveRes] = await Promise.all([
          supabase
            .from('lab_progress')
            .select('completed_at')
            .eq('user_id', user.id)
            .gte('completed_at', startDate)
            .lte('completed_at', endDate),
          supabase
            .from('user_achievements')
            .select('earned_at')
            .eq('user_id', user.id)
            .gte('earned_at', startDate)
            .lte('earned_at', endDate),
        ]);

        const map: Record<string, number> = {};

        (labRes.data || []).forEach((row) => {
          const day = row.completed_at.slice(0, 10);
          map[day] = (map[day] || 0) + 1;
        });

        (achieveRes.data || []).forEach((row) => {
          const day = row.earned_at.slice(0, 10);
          map[day] = (map[day] || 0) + 1;
        });

        setActivityMap(map);
      } catch (error) {
        console.error('Error fetching activity:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [user, year]);

  const { weeks, totalEvents } = useMemo(() => {
    // Build grid: 53 columns x 7 rows
    const firstDay = new Date(year, 0, 1);
    const startDayOfWeek = (firstDay.getDay() + 6) % 7; // Monday = 0

    const allDays: (DayData | null)[][] = [];
    let currentWeek: (DayData | null)[] = [];

    // Fill initial empty cells
    for (let i = 0; i < startDayOfWeek; i++) {
      currentWeek.push(null);
    }

    const daysInYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 366 : 365;
    let total = 0;

    for (let d = 0; d < daysInYear; d++) {
      const date = new Date(year, 0, 1 + d);
      const dateStr = date.toISOString().slice(0, 10);
      const count = activityMap[dateStr] || 0;
      total += count;
      currentWeek.push({ date: dateStr, count });

      if (currentWeek.length === 7) {
        allDays.push(currentWeek);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      allDays.push(currentWeek);
    }

    return { weeks: allDays, totalEvents: total };
  }, [year, activityMap]);

  // Calculate month label positions
  const monthPositions = useMemo(() => {
    const positions: { month: string; col: number }[] = [];
    let lastMonth = -1;

    weeks.forEach((week, weekIdx) => {
      for (const day of week) {
        if (day) {
          const month = parseInt(day.date.slice(5, 7)) - 1;
          if (month !== lastMonth) {
            positions.push({ month: MONTHS[month], col: weekIdx });
            lastMonth = month;
          }
          break;
        }
      }
    });

    return positions;
  }, [weeks]);

  const currentYear = new Date().getFullYear();

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Yearly Activity
          </h3>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setYear(y => y - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-foreground font-semibold text-sm min-w-[3rem] text-center">{year}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setYear(y => y + 1)} disabled={year >= currentYear}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Legend + Total */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 text-xs text-muted-foreground border border-border rounded-md px-3 py-1.5">
            <span className="font-medium">Key</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-secondary/40" /> No activity</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-amber-400" /> 1 event</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-cyan-400" /> 2 events</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-primary" /> ≥ 3 events</span>
          </div>
          <div className="border border-border rounded-md px-3 py-1.5 text-xs text-muted-foreground">
            Total events this year <span className="text-foreground font-bold text-sm ml-1">{totalEvents}</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              {/* Month labels */}
              <div className="flex ml-10 mb-1">
                {monthPositions.map(({ month, col }, i) => {
                  const nextCol = monthPositions[i + 1]?.col ?? weeks.length;
                  const span = nextCol - col;
                  return (
                    <div
                      key={month + col}
                      className="text-xs text-muted-foreground font-medium"
                      style={{ width: `${(span / weeks.length) * 100}%` }}
                    >
                      {month}
                    </div>
                  );
                })}
              </div>

              {/* Grid: rows = days of week, columns = weeks */}
              <div className="flex gap-[1px]">
                {/* Day labels */}
                <div className="flex flex-col gap-[1px] pr-2 pt-0">
                  {DAYS_OF_WEEK.map((day, i) => (
                    <div key={day} className="h-[14px] flex items-center">
                      {i % 2 === 1 ? (
                        <span className="text-[10px] text-muted-foreground w-7 text-right">{day}</span>
                      ) : (
                        <span className="w-7" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Week columns */}
                {weeks.map((week, weekIdx) => (
                  <div key={weekIdx} className="flex flex-col gap-[1px]">
                    {week.map((day, dayIdx) => (
                      <div
                        key={dayIdx}
                        className={cn(
                          'w-[14px] h-[14px] rounded-[2px] transition-colors',
                          day ? getColor(day.count) : 'bg-transparent'
                        )}
                        title={day ? `${day.date}: ${getColorLabel(day.count)}` : ''}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer note */}
        <div className="mt-4 bg-primary/10 rounded-md px-4 py-2.5 text-center">
          <p className="text-xs text-muted-foreground">
            Activity events are measured by labs completed, achievements earned, and challenges solved.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityHeatmap;
