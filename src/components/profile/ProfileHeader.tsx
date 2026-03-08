import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, Loader2, MapPin, Lock, Globe, ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface ProfileHeaderProps {
  userId: string;
  email: string;
  username: string;
  avatarUrl: string;
  location: string;
  isPublic: boolean;
  onAvatarChange: (url: string) => void;
  onVisibilityChange: (isPublic: boolean) => void;
  onEditClick: () => void;
}

export const ProfileHeader = ({
  userId,
  email,
  username,
  avatarUrl,
  location,
  isPublic,
  onAvatarChange,
  onVisibilityChange,
  onEditClick,
}: ProfileHeaderProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const getInitials = () => {
    if (username) return username.slice(0, 2).toUpperCase();
    return email?.slice(0, 2).toUpperCase() || 'U';
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file type', description: 'Please upload an image file', variant: 'destructive' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Please upload an image smaller than 2MB', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const newUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      onAvatarChange(newUrl);

      await supabase.from('profiles').upsert({ user_id: userId, avatar_url: newUrl }, { onConflict: 'user_id' });
      toast({ title: 'Success', description: 'Avatar uploaded successfully' });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({ title: 'Error', description: 'Failed to upload avatar', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
      <div className="relative group">
        <Avatar className="h-28 w-28 border-2 border-primary/30">
          <AvatarImage src={avatarUrl} alt={username || 'Avatar'} />
          <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 shadow-lg hover:bg-primary/90 transition-colors"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
      </div>

      <div className="flex-1 space-y-1">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {username || 'Anonymous User'}
          </h1>
          {username && (
            <span className="text-muted-foreground text-sm">@{username}</span>
          )}
        </div>
        {location && (
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <MapPin className="h-3.5 w-3.5" />
            {location}
          </div>
        )}
        <p className="text-sm text-muted-foreground">{email}</p>
      </div>

      <div className="flex items-center gap-2 self-start">
        <Button variant="outline" size="sm" onClick={onEditClick}>
          Edit Profile
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              {isPublic ? <Globe className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
              {isPublic ? 'Public' : 'Private'}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onVisibilityChange(true)} className="gap-2">
              <Globe className="h-4 w-4" /> Public
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onVisibilityChange(false)} className="gap-2">
              <Lock className="h-4 w-4" /> Private
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
