import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Github, Linkedin, Twitter, Globe, GraduationCap, Lock, UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { CommunityStats } from './CommunityStats';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
}

interface ProfileSidebarProps {
  username: string;
  email: string;
  avatarUrl: string;
  location: string;
  isPublic: boolean;
  rank: number;
  followers?: number;
  following?: number;
  socialLinks: SocialLinks;
  certifications: string[];
  skills: string[];
  community: { views: number; solutions: number; discuss: number; reputation: number };
  onEditClick: () => void;
  profileUserId?: string;
  currentUserId?: string;
}

const initials = (name: string, email: string) => {
  if (name) return name.slice(0, 2).toUpperCase();
  return email?.slice(0, 2).toUpperCase() || 'U';
};

const handleFromUrl = (url?: string) => {
  if (!url) return null;
  try {
    const u = new URL(url);
    const p = u.pathname.replace(/^\/+|\/+$/g, '').split('/').pop();
    return p || u.hostname;
  } catch {
    return url;
  }
};

export const ProfileSidebar = ({
  username, email, avatarUrl, location, isPublic, rank, followers = 0, following = 0,
  socialLinks, certifications, skills, community, onEditClick,
  profileUserId, currentUserId,
}: ProfileSidebarProps) => {
  const { toast } = useToast();
  const isOwnProfile = !profileUserId || !currentUserId || profileUserId === currentUserId;

  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(followers);
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => setFollowerCount(followers), [followers]);

  useEffect(() => {
    if (isOwnProfile || !currentUserId || !profileUserId) return;
    let cancelled = false;
    setChecking(true);
    supabase
      .from('user_follows')
      .select('id')
      .eq('follower_id', currentUserId)
      .eq('following_id', profileUserId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setIsFollowing(!!data);
      })
      .then(() => !cancelled && setChecking(false));
    return () => { cancelled = true; };
  }, [isOwnProfile, currentUserId, profileUserId]);

  const handleToggleFollow = async () => {
    if (!currentUserId || !profileUserId || busy) return;
    setBusy(true);
    const wasFollowing = isFollowing;
    // Optimistic update
    setIsFollowing(!wasFollowing);
    setFollowerCount((c) => c + (wasFollowing ? -1 : 1));
    try {
      if (wasFollowing) {
        const { error } = await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', currentUserId)
          .eq('following_id', profileUserId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_follows')
          .insert({ follower_id: currentUserId, following_id: profileUserId });
        if (error) throw error;
      }
    } catch (e: any) {
      // Rollback
      setIsFollowing(wasFollowing);
      setFollowerCount((c) => c + (wasFollowing ? 1 : -1));
      toast({ title: 'Action failed', description: e.message || 'Could not update follow', variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <aside className="lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto lg:pr-2 space-y-5 min-w-0">
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-20 w-20 rounded-lg border border-border">
            <AvatarImage src={avatarUrl} alt={username} className="object-cover" />
            <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-2xl font-bold">
              {initials(username, email)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-foreground truncate">{username || 'Anonymous'}</h1>
            {username && <p className="text-xs text-muted-foreground truncate">@{username}</p>}
            <p className="text-sm mt-1 text-foreground">
              Rank <span className="font-semibold">{rank.toLocaleString()}</span>
            </p>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          <span className="text-foreground font-medium">{following}</span> Following
          <span className="mx-2 opacity-50">|</span>
          <span className="text-foreground font-medium">{followerCount}</span> Followers
        </div>

        {isOwnProfile ? (
          <Button variant="secondary" className="w-full" onClick={onEditClick}>
            Edit Profile
          </Button>
        ) : (
          <Button
            variant={isFollowing ? 'secondary' : 'default'}
            className="w-full gap-2 transition-all"
            onClick={handleToggleFollow}
            disabled={busy || checking || !currentUserId}
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isFollowing ? (
              <UserCheck className="h-4 w-4" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            {isFollowing ? 'Following' : 'Follow'}
          </Button>
        )}
      </div>

      <ul className="space-y-2 text-sm">
        {location && (
          <li className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" /> <span className="text-foreground">{location}</span>
          </li>
        )}
        {certifications.length > 0 && (
          <li className="flex items-center gap-2 text-muted-foreground">
            <GraduationCap className="h-4 w-4" />
            <span className="text-foreground truncate">{certifications[0]}{certifications.length > 1 ? ` +${certifications.length - 1}` : ''}</span>
          </li>
        )}
        {socialLinks.github && (
          <li><a href={socialLinks.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-primary"><Github className="h-4 w-4" /> {handleFromUrl(socialLinks.github)}</a></li>
        )}
        {socialLinks.linkedin && (
          <li><a href={socialLinks.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-primary"><Linkedin className="h-4 w-4" /> {handleFromUrl(socialLinks.linkedin)}</a></li>
        )}
        {socialLinks.twitter && (
          <li><a href={socialLinks.twitter} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-primary"><Twitter className="h-4 w-4" /> {handleFromUrl(socialLinks.twitter)}</a></li>
        )}
        {socialLinks.website && (
          <li><a href={socialLinks.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-primary"><Globe className="h-4 w-4" /> {handleFromUrl(socialLinks.website)}</a></li>
        )}
        <li className="text-xs text-muted-foreground pt-1 flex items-center gap-1.5">
          {isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
          {isPublic ? 'Public profile' : 'Private profile'}
        </li>
      </ul>

      <div className="border-t border-border pt-4">
        <CommunityStats
          views={community.views}
          solutions={community.solutions}
          discuss={community.discuss}
          reputation={community.reputation}
        />
      </div>

      {skills.length > 0 && (
        <div className="border-t border-border pt-4 space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Languages</h3>
          <div className="flex flex-wrap gap-1.5">
            {skills.slice(0, 8).map((s) => (
              <Badge key={s} variant="secondary" className="text-xs font-normal">{s}</Badge>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};
