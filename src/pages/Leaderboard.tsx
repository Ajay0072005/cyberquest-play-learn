import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Trophy, Medal, Award } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  points: number;
}

const Leaderboard = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // Fetch from the secure leaderboard table
        const { data, error } = await supabase
          .from('leaderboard')
          .select('id, user_id, username, avatar_url, points')
          .order('points', { ascending: false })
          .limit(50);

        if (error) throw error;

        setEntries(data || []);

        // Find current user's rank in the leaderboard
        if (user && data) {
          const userEntry = data.find(entry => entry.user_id === user.id);
          if (userEntry) {
            setCurrentUserId(userEntry.id);
            const rank = data.findIndex(entry => entry.user_id === user.id);
            setUserRank(rank !== -1 ? rank + 1 : null);
          }
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();

    // Subscribe to realtime updates on the leaderboard table
    const channel = supabase
      .channel('leaderboard-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leaderboard'
        },
        () => {
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const getInitials = (username: string | null, index: number) => {
    if (username) return username.slice(0, 2).toUpperCase();
    return `U${index + 1}`;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-muted-foreground font-mono w-6 text-center">{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 2:
        return 'bg-gray-400/20 text-gray-400 border-gray-400/30';
      case 3:
        return 'bg-amber-600/20 text-amber-600 border-amber-600/30';
      default:
        return 'bg-primary/20 text-primary border-primary/30';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Leaderboard</h1>
            <p className="text-muted-foreground mt-1">Top cyber security challengers</p>
          </div>
          {userRank && (
            <Badge variant="outline" className="self-start md:self-auto px-4 py-2 text-sm">
              Your Rank: #{userRank}
            </Badge>
          )}
        </div>

        {/* Top 3 Podium */}
        {entries.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* Second Place */}
            <Card className="bg-card border-gray-400/30 mt-8">
              <CardContent className="pt-6 text-center">
                <div className="relative inline-block">
                  <Avatar className="h-16 w-16 mx-auto border-2 border-gray-400">
                    <AvatarImage src={entries[1]?.avatar_url || ''} />
                    <AvatarFallback className="bg-gray-400/10 text-gray-400">
                      {getInitials(entries[1]?.username, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <Medal className="absolute -top-2 -right-2 h-6 w-6 text-gray-400" />
                </div>
                <p className="font-semibold mt-3 text-foreground truncate">
                  {entries[1]?.username || 'Anonymous'}
                </p>
                <p className="text-xl font-bold text-gray-400">{entries[1]?.points.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">points</p>
              </CardContent>
            </Card>

            {/* First Place */}
            <Card className="bg-card border-yellow-500/30">
              <CardContent className="pt-6 text-center">
                <div className="relative inline-block">
                  <Avatar className="h-20 w-20 mx-auto border-2 border-yellow-500">
                    <AvatarImage src={entries[0]?.avatar_url || ''} />
                    <AvatarFallback className="bg-yellow-500/10 text-yellow-500">
                      {getInitials(entries[0]?.username, 0)}
                    </AvatarFallback>
                  </Avatar>
                  <Trophy className="absolute -top-2 -right-2 h-7 w-7 text-yellow-500" />
                </div>
                <p className="font-semibold mt-3 text-foreground truncate">
                  {entries[0]?.username || 'Anonymous'}
                </p>
                <p className="text-2xl font-bold text-yellow-500">{entries[0]?.points.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">points</p>
              </CardContent>
            </Card>

            {/* Third Place */}
            <Card className="bg-card border-amber-600/30 mt-8">
              <CardContent className="pt-6 text-center">
                <div className="relative inline-block">
                  <Avatar className="h-16 w-16 mx-auto border-2 border-amber-600">
                    <AvatarImage src={entries[2]?.avatar_url || ''} />
                    <AvatarFallback className="bg-amber-600/10 text-amber-600">
                      {getInitials(entries[2]?.username, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <Award className="absolute -top-2 -right-2 h-6 w-6 text-amber-600" />
                </div>
                <p className="font-semibold mt-3 text-foreground truncate">
                  {entries[2]?.username || 'Anonymous'}
                </p>
                <p className="text-xl font-bold text-amber-600">{entries[2]?.points.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">points</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Full Leaderboard */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Rankings</CardTitle>
            <CardDescription>Top 50 players by points</CardDescription>
          </CardHeader>
          <CardContent>
            {entries.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No entries yet. Start completing challenges to appear on the leaderboard!
              </p>
            ) : (
              <div className="space-y-2">
                {entries.map((entry, index) => (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                      entry.id === currentUserId
                        ? 'bg-primary/10 border border-primary/20'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="w-8 flex justify-center">
                      {getRankIcon(index + 1)}
                    </div>
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarImage src={entry.avatar_url || ''} />
                      <AvatarFallback className="bg-muted text-muted-foreground">
                        {getInitials(entry.username, index)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {entry.username || 'Anonymous'}
                        {entry.id === currentUserId && (
                          <Badge variant="secondary" className="ml-2 text-xs">You</Badge>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Level {Math.floor(entry.points / 1000) + 1}
                      </p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`${getRankBadgeColor(index + 1)} font-mono`}
                    >
                      {entry.points.toLocaleString()} pts
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Leaderboard;
