import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useModeratorRole } from '@/hooks/useModeratorRole';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Search, Eye, Ban, CheckCircle, Shield, Users, Trophy, Flag } from 'lucide-react';
import { toast } from 'sonner';

interface LeaderboardEntry {
  id: string;
  user_id: string;
  username: string | null;
  points: number;
  updated_at: string;
}

interface UserProfile {
  id: string;
  user_id: string;
  username: string | null;
  points: number;
  avatar_url: string | null;
  created_at: string;
}

const ModeratorDashboard = () => {
  const navigate = useNavigate();
  const { isModerator, loading: roleLoading } = useModeratorRole();
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
  const [flaggedUsers, setFlaggedUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('leaderboard');

  useEffect(() => {
    if (!roleLoading && !isModerator) {
      toast.error('Access denied. Moderator privileges required.');
      navigate('/dashboard');
    }
  }, [isModerator, roleLoading, navigate]);

  useEffect(() => {
    if (isModerator) {
      fetchLeaderboard();
      fetchFlaggedUsers();
    }
  }, [isModerator]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('points', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLeaderboardEntries(data || []);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      toast.error('Failed to fetch leaderboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchFlaggedUsers = async () => {
    try {
      // Get users with suspiciously high points (potential cheaters)
      // This is a simple heuristic - in production, you'd have a proper flagging system
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .gt('points', 10000)
        .order('points', { ascending: false })
        .limit(20);

      if (error) throw error;
      setFlaggedUsers(data || []);
    } catch (err) {
      console.error('Error fetching flagged users:', err);
    }
  };

  const resetUserScore = async (userId: string, username: string | null) => {
    try {
      // Moderators can only reset scores, not delete entries
      const { error } = await supabase
        .from('leaderboard')
        .update({ points: 0 })
        .eq('user_id', userId);

      if (error) throw error;
      
      toast.success(`Score reset for ${username || 'user'}`);
      fetchLeaderboard();
    } catch (err) {
      console.error('Error resetting score:', err);
      toast.error('Failed to reset score. You may not have permission.');
    }
  };

  const filteredLeaderboard = leaderboardEntries.filter(entry =>
    entry.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.user_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (roleLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isModerator) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-cyber font-bold flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              Moderator Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor and moderate user activity
            </p>
          </div>
          <Badge variant="secondary" className="text-sm">
            <Shield className="h-4 w-4 mr-1" />
            Moderator Access
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card/50 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Leaderboard Entries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{leaderboardEntries.length}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Highest Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {leaderboardEntries[0]?.points.toLocaleString() || 0}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Flag className="h-4 w-4 text-warning" />
                Flagged for Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-warning">{flaggedUsers.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/50">
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Leaderboard Review
            </TabsTrigger>
            <TabsTrigger value="flagged" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Flagged Users
            </TabsTrigger>
          </TabsList>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-4">
            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle>Leaderboard Management</CardTitle>
                <CardDescription>
                  Review and moderate leaderboard entries. You can reset scores for suspicious activity.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by username or user ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-background"
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : (
                  <div className="rounded-md border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>Rank</TableHead>
                          <TableHead>Username</TableHead>
                          <TableHead>Points</TableHead>
                          <TableHead>Last Updated</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredLeaderboard.map((entry, index) => (
                          <TableRow key={entry.id}>
                            <TableCell className="font-medium">#{index + 1}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {entry.username || 'Anonymous'}
                                {entry.points > 10000 && (
                                  <Badge variant="outline" className="text-warning border-warning">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    High Score
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{entry.points.toLocaleString()}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(entry.updated_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => resetUserScore(entry.user_id, entry.username)}
                                  className="text-warning hover:text-warning hover:bg-warning/10"
                                >
                                  <Ban className="h-4 w-4 mr-1" />
                                  Reset Score
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {filteredLeaderboard.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                              No leaderboard entries found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Flagged Users Tab */}
          <TabsContent value="flagged" className="space-y-4">
            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  Flagged for Review
                </CardTitle>
                <CardDescription>
                  Users with unusually high points that may require investigation
                </CardDescription>
              </CardHeader>
              <CardContent>
                {flaggedUsers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
                    <p>No suspicious activity detected</p>
                  </div>
                ) : (
                  <div className="rounded-md border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>Username</TableHead>
                          <TableHead>Points</TableHead>
                          <TableHead>Account Created</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {flaggedUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">
                              {user.username || 'Anonymous'}
                            </TableCell>
                            <TableCell className="text-warning font-bold">
                              {user.points.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(user.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-warning border-warning">
                                <Eye className="h-3 w-3 mr-1" />
                                Under Review
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Moderator Guidelines */}
            <Card className="bg-muted/30 border-border">
              <CardHeader>
                <CardTitle className="text-lg">Moderator Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p>Reset scores only when there's clear evidence of cheating or exploitation</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p>Document the reason for any moderation action you take</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p>Escalate serious violations to an admin for account deletion</p>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                  <p>Moderators cannot delete leaderboard entries - only admins have that permission</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ModeratorDashboard;
