import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, KeyRound, Eye, EyeOff, Github, Linkedin, Twitter, Globe, Link as LinkIcon } from 'lucide-react';
import { PasswordStrengthIndicator, isPasswordStrong } from '@/components/PasswordStrengthIndicator';
import AvatarCustomizer from '@/components/avatar/AvatarCustomizer';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileSection } from '@/components/profile/ProfileSection';
import { TagInput } from '@/components/profile/TagInput';

interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
  [key: string]: string | undefined;
}

const ProfileSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  // Edit states for sections
  const [editingSummary, setEditingSummary] = useState(false);
  const [editingSocials, setEditingSocials] = useState(false);
  const [editingSkills, setEditingSkills] = useState(false);
  const [editingCerts, setEditingCerts] = useState(false);
  const [editingInterests, setEditingInterests] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);

  // Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (data) {
          setUsername(data.username || '');
          setAvatarUrl(data.avatar_url || '');
          setSummary((data as any).summary || '');
          setSocialLinks((data as any).social_links || {});
          setSkills((data as any).skills || []);
          setCertifications((data as any).certifications || []);
          setInterests((data as any).interests || []);
          setIsPublic((data as any).is_public || false);
          setLocation((data as any).location || '');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({ title: 'Error', description: 'Failed to load profile data', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user, toast]);

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

  const handleVisibilityChange = async (pub: boolean) => {
    setIsPublic(pub);
    await saveProfile({ is_public: pub });
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
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Profile Header */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <ProfileHeader
              userId={user?.id || ''}
              email={user?.email || ''}
              username={username}
              avatarUrl={avatarUrl}
              location={location}
              isPublic={isPublic}
              onAvatarChange={setAvatarUrl}
              onVisibilityChange={handleVisibilityChange}
              onEditClick={() => setEditingProfile(!editingProfile)}
            />

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
                <div className="flex gap-2">
                  <Button size="sm" disabled={saving} onClick={async () => {
                    await saveProfile({ username: username.trim() || null, location: location.trim() || null });
                    setEditingProfile(false);
                  }}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingProfile(false)}>Cancel</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Summary */}
            <ProfileSection
              title="Summary"
              placeholder="Tell the world about yourself and your hacking super powers..."
              isEmpty={!summary}
              addLabel="Add summary"
              isEditing={editingSummary}
              onEditToggle={setEditingSummary}
              editForm={
                <div className="space-y-3">
                  <Textarea value={summary} onChange={e => setSummary(e.target.value)} placeholder="Write about yourself..." className="bg-background border-border min-h-[100px]" maxLength={500} />
                  <p className="text-xs text-muted-foreground">{summary.length}/500</p>
                  <div className="flex gap-2">
                    <Button size="sm" disabled={saving} onClick={async () => {
                      await saveProfile({ summary: summary.trim() || null });
                      setEditingSummary(false);
                    }}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingSummary(false)}>Cancel</Button>
                  </div>
                </div>
              }
            >
              <p className="text-foreground text-sm whitespace-pre-wrap">{summary}</p>
            </ProfileSection>

            {/* Certifications */}
            <ProfileSection
              title="Certifications"
              placeholder="Share with us your biggest achievements."
              isEmpty={certifications.length === 0}
              addLabel="Add certifications"
              isEditing={editingCerts}
              onEditToggle={setEditingCerts}
              editForm={
                <div className="space-y-3">
                  <TagInput tags={certifications} onChange={setCertifications} placeholder="e.g. CEH, OSCP, CompTIA Security+" />
                  <div className="flex gap-2">
                    <Button size="sm" disabled={saving} onClick={async () => {
                      await saveProfile({ certifications });
                      setEditingCerts(false);
                    }}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingCerts(false)}>Cancel</Button>
                  </div>
                </div>
              }
            >
              <div className="flex flex-wrap gap-2">
                {certifications.map(cert => (
                  <Badge key={cert} variant="secondary" className="px-3 py-1">{cert}</Badge>
                ))}
              </div>
            </ProfileSection>

            {/* Skills */}
            <ProfileSection
              title="Skills"
              placeholder="Show off your technical skills."
              isEmpty={skills.length === 0}
              addLabel="Add skills"
              isEditing={editingSkills}
              onEditToggle={setEditingSkills}
              editForm={
                <div className="space-y-3">
                  <TagInput tags={skills} onChange={setSkills} placeholder="e.g. Penetration Testing, Python, Network Security" />
                  <div className="flex gap-2">
                    <Button size="sm" disabled={saving} onClick={async () => {
                      await saveProfile({ skills });
                      setEditingSkills(false);
                    }}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingSkills(false)}>Cancel</Button>
                  </div>
                </div>
              }
            >
              <div className="flex flex-wrap gap-2">
                {skills.map(skill => (
                  <Badge key={skill} className="bg-primary/10 text-primary border-primary/20 px-3 py-1">{skill}</Badge>
                ))}
              </div>
            </ProfileSection>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Socials */}
            <ProfileSection
              title="Socials"
              placeholder="Add your social profiles and a website link."
              isEmpty={!socialLinks.github && !socialLinks.linkedin && !socialLinks.twitter && !socialLinks.website}
              addLabel="Add socials"
              isEditing={editingSocials}
              onEditToggle={setEditingSocials}
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
                    <Button size="sm" disabled={saving} onClick={async () => {
                      await saveProfile({ social_links: socialLinks });
                      setEditingSocials(false);
                    }}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingSocials(false)}>Cancel</Button>
                  </div>
                </div>
              }
            >
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
            </ProfileSection>

            {/* Top Interests */}
            <ProfileSection
              title="Top Interests"
              placeholder="Let us know what are your top interests."
              isEmpty={interests.length === 0}
              addLabel="Add interests"
              isEditing={editingInterests}
              onEditToggle={setEditingInterests}
              editForm={
                <div className="space-y-3">
                  <TagInput tags={interests} onChange={setInterests} placeholder="e.g. CTF, Bug Bounty, Malware Analysis" />
                  <div className="flex gap-2">
                    <Button size="sm" disabled={saving} onClick={async () => {
                      await saveProfile({ interests });
                      setEditingInterests(false);
                    }}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingInterests(false)}>Cancel</Button>
                  </div>
                </div>
              }
            >
              <div className="flex flex-wrap gap-2">
                {interests.map(interest => (
                  <Badge key={interest} variant="outline" className="border-primary/30 text-foreground px-3 py-1">{interest}</Badge>
                ))}
              </div>
            </ProfileSection>
          </div>
        </div>

        {/* Change Password */}
        <Card className="bg-card border-border">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" />
              Change Password
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input id="new-password" type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter new password" className="bg-background border-border pr-10" />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <PasswordStrengthIndicator password={newPassword} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <div className="relative">
                  <Input id="confirm-password" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm new password" className="bg-background border-border pr-10" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
            <Button
              disabled={changingPassword || !newPassword || !confirmPassword}
              className="gap-2"
              onClick={async () => {
                if (newPassword.length < 8) {
                  toast({ title: 'Password too short', description: 'Password must be at least 8 characters', variant: 'destructive' });
                  return;
                }
                if (!isPasswordStrong(newPassword)) {
                  toast({ title: 'Weak Password', description: 'Please choose a stronger password', variant: 'destructive' });
                  return;
                }
                if (newPassword !== confirmPassword) {
                  toast({ title: 'Passwords do not match', description: 'Please make sure both passwords are the same', variant: 'destructive' });
                  return;
                }
                setChangingPassword(true);
                try {
                  const { error } = await supabase.auth.updateUser({ password: newPassword });
                  if (error) throw error;
                  toast({ title: 'Success', description: 'Your password has been updated' });
                  setNewPassword('');
                  setConfirmPassword('');
                } catch (error: any) {
                  toast({ title: 'Error', description: error.message || 'Failed to update password', variant: 'destructive' });
                } finally {
                  setChangingPassword(false);
                }
              }}
            >
              {changingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
              Update Password
            </Button>
          </CardContent>
        </Card>

        {/* AI Tutor Avatar */}
        <AvatarCustomizer />
      </div>
    </DashboardLayout>
  );
};

export default ProfileSettings;
