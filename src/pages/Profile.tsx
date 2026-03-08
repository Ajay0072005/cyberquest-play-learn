import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MapPin, Github, Linkedin, Twitter, Globe, Lock, Trophy, Award, Pencil, Save } from 'lucide-react';
import { ProfileSection } from '@/components/profile/ProfileSection';
import { TagInput } from '@/components/profile/TagInput';
import AvatarCustomizer from '@/components/avatar/AvatarCustomizer';

interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
  [key: string]: string | undefined;
}

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [achievementCount, setAchievementCount] = useState(0);

  // Profile data
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({});
  const [skills, setSkills] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [location, setLocation] = useState('');
  const [points, setPoints] = useState(0);

  // Edit states
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingSummary, setEditingSummary] = useState(false);
  const [editingSocials, setEditingSocials] = useState(false);
  const [editingSkills, setEditingSkills] = useState(false);
  const [editingCerts, setEditingCerts] = useState(false);
  const [editingInterests, setEditingInterests] = useState(false);

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
          setUsername(d.username || '');
          setAvatarUrl(d.avatar_url || '');
          setSummary(d.summary || '');
          setSocialLinks(d.social_links || {});
          setSkills(d.skills || []);
          setCertifications(d.certifications || []);
          setInterests(d.interests || []);
          setIsPublic(d.is_public || false);
          setLocation(d.location || '');
          setPoints(d.points || 0);
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

  const saveProfile = async (fields: Record<string, any>) => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ user_id: user.id, ...fields } as any, { onConflict: 'user_id' });
      if (error) throw error;
      toast({ title: 'Success', description: 'Profile updated successfully' });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({ title: 'Error', description: 'Failed to update profile', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const getInitials = () => {
    if (username) return username.slice(0, 2).toUpperCase();
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

  const hasSocials = !!(socialLinks.github || socialLinks.linkedin || socialLinks.twitter || socialLinks.website);

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Profile Header */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <Avatar className="h-28 w-28 border-2 border-primary/30">
                <AvatarImage src={avatarUrl} alt={username || 'Avatar'} />
                <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                    {username || 'Anonymous User'}
                  </h1>
                  {username && <span className="text-muted-foreground text-sm">@{username}</span>}
                </div>
                {location && (
                  <div className="flex items-center gap-1 text-muted-foreground text-sm">
                    <MapPin className="h-3.5 w-3.5" /> {location}
                  </div>
                )}
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Trophy className="h-4 w-4 text-primary" />
                    <span className="text-foreground font-medium">{points}</span>
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
                <Badge variant={isPublic ? 'default' : 'secondary'} className="gap-1.5">
                  {isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                  {isPublic ? 'Public' : 'Private'}
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setEditingProfile(!editingProfile)} className="gap-1.5">
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
              </div>
            </div>

            {editingProfile && (
              <div className="mt-6 pt-6 border-t border-border space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter username" className="bg-background border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. India" className="bg-background border-border" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Visibility</Label>
                  <div className="flex gap-2">
                    <Button size="sm" variant={isPublic ? 'default' : 'outline'} onClick={() => setIsPublic(true)}>
                      <Globe className="h-3.5 w-3.5 mr-1" /> Public
                    </Button>
                    <Button size="sm" variant={!isPublic ? 'default' : 'outline'} onClick={() => setIsPublic(false)}>
                      <Lock className="h-3.5 w-3.5 mr-1" /> Private
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" disabled={saving} onClick={async () => {
                    await saveProfile({ username: username.trim() || null, location: location.trim() || null, is_public: isPublic });
                    setEditingProfile(false);
                  }}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    <span className="ml-1">Save</span>
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingProfile(false)}>Cancel</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <ProfileSection title="Summary" placeholder="Tell the world about yourself..." isEmpty={!summary} addLabel="Add summary" isEditing={editingSummary} onEditToggle={setEditingSummary}
              editForm={
                <div className="space-y-3">
                  <Textarea value={summary} onChange={e => setSummary(e.target.value)} placeholder="Write about yourself..." className="bg-background border-border min-h-[100px]" maxLength={500} />
                  <p className="text-xs text-muted-foreground">{summary.length}/500</p>
                  <div className="flex gap-2">
                    <Button size="sm" disabled={saving} onClick={async () => { await saveProfile({ summary: summary.trim() || null }); setEditingSummary(false); }}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingSummary(false)}>Cancel</Button>
                  </div>
                </div>
              }
            >
              <p className="text-foreground text-sm whitespace-pre-wrap">{summary}</p>
            </ProfileSection>

            <ProfileSection title="Certifications" placeholder="Share your biggest achievements." isEmpty={certifications.length === 0} addLabel="Add certifications" isEditing={editingCerts} onEditToggle={setEditingCerts}
              editForm={
                <div className="space-y-3">
                  <TagInput tags={certifications} onChange={setCertifications} placeholder="e.g. CEH, OSCP" suggestions={['CEH', 'OSCP', 'CISSP', 'CompTIA Security+', 'CompTIA Network+', 'CISM', 'CISA', 'GPEN', 'GCIH', 'GSEC', 'OSWE', 'OSCE', 'eJPT', 'eCPPT', 'AWS Security Specialty', 'Azure Security Engineer', 'CCNA Security', 'SSCP', 'CASP+', 'CySA+']} />
                  <div className="flex gap-2">
                    <Button size="sm" disabled={saving} onClick={async () => { await saveProfile({ certifications }); setEditingCerts(false); }}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingCerts(false)}>Cancel</Button>
                  </div>
                </div>
              }
            >
              <div className="flex flex-wrap gap-2">
                {certifications.map(cert => <Badge key={cert} variant="secondary" className="px-3 py-1">{cert}</Badge>)}
              </div>
            </ProfileSection>

            <ProfileSection title="Skills" placeholder="Show off your technical skills." isEmpty={skills.length === 0} addLabel="Add skills" isEditing={editingSkills} onEditToggle={setEditingSkills}
              editForm={
                <div className="space-y-3">
                  <TagInput tags={skills} onChange={setSkills} placeholder="e.g. Penetration Testing, Python" suggestions={['Penetration Testing', 'Python', 'Network Security', 'Ethical Hacking', 'Malware Analysis', 'Reverse Engineering', 'Cryptography', 'Web Security', 'Cloud Security', 'Incident Response', 'Digital Forensics', 'OSINT', 'Social Engineering', 'Firewall Management', 'SIEM', 'Threat Modeling', 'Vulnerability Assessment', 'Linux', 'Bash Scripting', 'Wireshark']} />
                  <div className="flex gap-2">
                    <Button size="sm" disabled={saving} onClick={async () => { await saveProfile({ skills }); setEditingSkills(false); }}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingSkills(false)}>Cancel</Button>
                  </div>
                </div>
              }
            >
              <div className="flex flex-wrap gap-2">
                {skills.map(skill => <Badge key={skill} className="bg-primary/10 text-primary border-primary/20 px-3 py-1">{skill}</Badge>)}
              </div>
            </ProfileSection>
          </div>

          <div className="space-y-6">
            <ProfileSection title="Socials" placeholder="Add your social profiles." isEmpty={!hasSocials} addLabel="Add socials" isEditing={editingSocials} onEditToggle={setEditingSocials}
              editForm={
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm"><Github className="h-4 w-4" /> GitHub</Label>
                    <Input value={socialLinks.github || ''} onChange={e => setSocialLinks(prev => ({ ...prev, github: e.target.value }))} placeholder="https://github.com/username" className="bg-background border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm"><Linkedin className="h-4 w-4" /> LinkedIn</Label>
                    <Input value={socialLinks.linkedin || ''} onChange={e => setSocialLinks(prev => ({ ...prev, linkedin: e.target.value }))} placeholder="https://linkedin.com/in/username" className="bg-background border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm"><Twitter className="h-4 w-4" /> Twitter / X</Label>
                    <Input value={socialLinks.twitter || ''} onChange={e => setSocialLinks(prev => ({ ...prev, twitter: e.target.value }))} placeholder="https://x.com/username" className="bg-background border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm"><Globe className="h-4 w-4" /> Website</Label>
                    <Input value={socialLinks.website || ''} onChange={e => setSocialLinks(prev => ({ ...prev, website: e.target.value }))} placeholder="https://yourwebsite.com" className="bg-background border-border" />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" disabled={saving} onClick={async () => { await saveProfile({ social_links: socialLinks }); setEditingSocials(false); }}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingSocials(false)}>Cancel</Button>
                  </div>
                </div>
              }
            >
              <div className="space-y-2">
                {socialLinks.github && <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"><Github className="h-4 w-4" /> {socialLinks.github}</a>}
                {socialLinks.linkedin && <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"><Linkedin className="h-4 w-4" /> {socialLinks.linkedin}</a>}
                {socialLinks.twitter && <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"><Twitter className="h-4 w-4" /> {socialLinks.twitter}</a>}
                {socialLinks.website && <a href={socialLinks.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"><Globe className="h-4 w-4" /> {socialLinks.website}</a>}
              </div>
            </ProfileSection>

            <ProfileSection title="Top Interests" placeholder="Let us know your top interests." isEmpty={interests.length === 0} addLabel="Add interests" isEditing={editingInterests} onEditToggle={setEditingInterests}
              editForm={
                <div className="space-y-3">
                  <TagInput tags={interests} onChange={setInterests} placeholder="e.g. CTF, Bug Bounty" suggestions={['CTF', 'Bug Bounty', 'Red Teaming', 'Blue Teaming', 'Purple Teaming', 'Threat Hunting', 'Malware Research', 'IoT Security', 'Mobile Security', 'Blockchain Security', 'AI/ML Security', 'Privacy', 'Compliance', 'DevSecOps', 'Zero Trust', 'Cyber Threat Intelligence', 'Incident Response', 'Digital Forensics', 'Automotive Security', 'SCADA/ICS']} />
                  <div className="flex gap-2">
                    <Button size="sm" disabled={saving} onClick={async () => { await saveProfile({ interests }); setEditingInterests(false); }}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingInterests(false)}>Cancel</Button>
                  </div>
                </div>
              }
            >
              <div className="flex flex-wrap gap-2">
                {interests.map(interest => <Badge key={interest} variant="outline" className="border-primary/30 text-foreground px-3 py-1">{interest}</Badge>)}
              </div>
            </ProfileSection>
          </div>
        </div>

        {/* AI Tutor Avatar */}
        <AvatarCustomizer />
      </div>
    </DashboardLayout>
  );
};

export default Profile;
