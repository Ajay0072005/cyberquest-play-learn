import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, MapPin, Github, Linkedin, Twitter, Globe, Lock, Settings, Trophy, Award } from 'lucide-react';

interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
}

interface ProfileData {
  username: string | null;
  avatar_url: string | null;
  summary: string | null;
  social_links: SocialLinks;
  skills: string[];
  certifications: string[];
  interests: string[];
  is_public: boolean;
  location: string | null;
  points: number;
}

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [achievementCount, setAchievementCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const [profileRes, achievementsRes] = await Promise.all([
          supabase.from('profiles').select('*').eq('user_id', user.id).single(),
          supabase.from('user_achievements').select('id', { count: 'exact' }).eq('user_id', user.id),
        ]);

        if (profileRes.error && profileRes.error.code !== 'PGRST116') throw profileRes.error;

        if (profileRes.data) {
          const d = profileRes.data as any;
          setProfile({
            username: d.username,
            avatar_url: d.avatar_url,
            summary: d.summary || null,
            social_links: d.social_links || {},
            skills: d.skills || [],
            certifications: d.certifications || [],
            interests: d.interests || [],
            is_public: d.is_public || false,
            location: d.location || null,
            points: d.points || 0,
          });
        }
        setAchievementCount(achievementsRes.count || 0);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const getInitials = () => {
    if (profile?.username) return profile.username.slice(0, 2).toUpperCase();
    return user?.email?.slice(0, 2).toUpperCase() || 'U';
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

  const socialLinks = profile?.social_links || {};
  const hasSocials = !!(socialLinks.github || socialLinks.linkedin || socialLinks.twitter || socialLinks.website);

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Profile Header */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <Avatar className="h-28 w-28 border-2 border-primary/30">
                <AvatarImage src={profile?.avatar_url || ''} alt={profile?.username || 'Avatar'} />
                <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                    {profile?.username || 'Anonymous User'}
                  </h1>
                  {profile?.username && (
                    <span className="text-muted-foreground text-sm">@{profile.username}</span>
                  )}
                </div>
                {profile?.location && (
                  <div className="flex items-center gap-1 text-muted-foreground text-sm">
                    <MapPin className="h-3.5 w-3.5" />
                    {profile.location}
                  </div>
                )}
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Trophy className="h-4 w-4 text-primary" />
                    <span className="text-foreground font-medium">{profile?.points || 0}</span>
                    <span className="text-muted-foreground">points</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Award className="h-4 w-4 text-primary" />
                    <span className="text-foreground font-medium">{achievementCount}</span>
                    <span className="text-muted-foreground">achievements</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start">
                <Badge variant={profile?.is_public ? 'default' : 'secondary'} className="gap-1.5">
                  {profile?.is_public ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                  {profile?.is_public ? 'Public' : 'Private'}
                </Badge>
                <Button variant="outline" size="sm" onClick={() => navigate('/settings')} className="gap-1.5">
                  <Settings className="h-3.5 w-3.5" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Summary */}
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">Summary</h2>
              <Card className="bg-card border-border">
                <CardContent className="p-5">
                  {profile?.summary ? (
                    <p className="text-foreground text-sm whitespace-pre-wrap">{profile.summary}</p>
                  ) : (
                    <p className="text-muted-foreground text-sm text-center py-4">No summary added yet.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Certifications */}
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">Certifications</h2>
              <Card className="bg-card border-border">
                <CardContent className="p-5">
                  {profile?.certifications && profile.certifications.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.certifications.map(cert => (
                        <Badge key={cert} variant="secondary" className="px-3 py-1">{cert}</Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm text-center py-4">No certifications added yet.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Skills */}
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">Skills</h2>
              <Card className="bg-card border-border">
                <CardContent className="p-5">
                  {profile?.skills && profile.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map(skill => (
                        <Badge key={skill} className="bg-primary/10 text-primary border-primary/20 px-3 py-1">{skill}</Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm text-center py-4">No skills added yet.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Socials */}
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">Socials</h2>
              <Card className="bg-card border-border">
                <CardContent className="p-5">
                  {hasSocials ? (
                    <div className="space-y-2">
                      {socialLinks.github && (
                        <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                          <Github className="h-4 w-4" /> {socialLinks.github}
                        </a>
                      )}
                      {socialLinks.linkedin && (
                        <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                          <Linkedin className="h-4 w-4" /> {socialLinks.linkedin}
                        </a>
                      )}
                      {socialLinks.twitter && (
                        <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                          <Twitter className="h-4 w-4" /> {socialLinks.twitter}
                        </a>
                      )}
                      {socialLinks.website && (
                        <a href={socialLinks.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                          <Globe className="h-4 w-4" /> {socialLinks.website}
                        </a>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm text-center py-4">No social links added yet.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Top Interests */}
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-foreground">Top Interests</h2>
              <Card className="bg-card border-border">
                <CardContent className="p-5">
                  {profile?.interests && profile.interests.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map(interest => (
                        <Badge key={interest} variant="outline" className="border-primary/30 text-foreground px-3 py-1">{interest}</Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm text-center py-4">No interests added yet.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
