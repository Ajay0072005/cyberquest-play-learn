import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SlidersHorizontal, Loader2, Save, Bot } from 'lucide-react';

const Preferences = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [echoEnabled, setEchoEnabled] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [tutorName, setTutorName] = useState('CyberBot');
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_public, ai_tutor_name')
          .eq('user_id', user.id)
          .single();
        if (error && error.code !== 'PGRST116') throw error;
        if (data) {
          setIsPrivate(!(data.is_public ?? false));
          setTutorName((data as any).ai_tutor_name || 'CyberBot');
        }
        const prefs = localStorage.getItem('cyberquest_prefs');
        if (prefs) {
          const parsed = JSON.parse(prefs);
          setEchoEnabled(parsed.echo ?? true);
          setSoundEffects(parsed.sound ?? true);
        }
      } catch (error) {
        console.error('Error fetching preferences:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const saveLocalPref = (key: string, value: boolean) => {
    const prefs = JSON.parse(localStorage.getItem('cyberquest_prefs') || '{}');
    prefs[key] = value;
    localStorage.setItem('cyberquest_prefs', JSON.stringify(prefs));
  };

  const handleEchoChange = (checked: boolean) => {
    setEchoEnabled(checked);
    saveLocalPref('echo', checked);
    toast({ title: 'Preference updated', description: `Echo ${checked ? 'enabled' : 'disabled'}` });
  };

  const handleSoundChange = (checked: boolean) => {
    setSoundEffects(checked);
    saveLocalPref('sound', checked);
    toast({ title: 'Preference updated', description: `Sound effects ${checked ? 'enabled' : 'disabled'}` });
  };

  const handlePrivacyChange = async (checked: boolean) => {
    if (!user) return;
    setIsPrivate(checked);
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ user_id: user.id, is_public: !checked } as any, { onConflict: 'user_id' });
      if (error) throw error;
      toast({ title: 'Preference updated', description: checked ? 'Profile is now private' : 'Profile is now public' });
    } catch (error) {
      console.error('Error updating privacy:', error);
      setIsPrivate(!checked);
      toast({ title: 'Error', description: 'Failed to update privacy setting', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTutorName = async () => {
    if (!user) return;
    setSavingName(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ user_id: user.id, ai_tutor_name: tutorName.trim() || 'CyberBot' } as any, { onConflict: 'user_id' });
      if (error) throw error;
      toast({ title: 'Preference updated', description: `AI assistant renamed to "${tutorName.trim() || 'CyberBot'}"` });
    } catch (error) {
      console.error('Error updating tutor name:', error);
      toast({ title: 'Error', description: 'Failed to update AI assistant name', variant: 'destructive' });
    } finally {
      setSavingName(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <SlidersHorizontal className="h-6 w-6 text-primary" />
          Preferences
        </h2>
        <p className="text-muted-foreground text-sm mt-1">Customize your platform experience</p>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-6 divide-y divide-border">
          {/* AI Assistant Name */}
          <div className="py-4 first:pt-0 space-y-3">
            <div>
              <p className="font-semibold text-foreground flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary" />
                AI Assistant Name
              </p>
              <p className="text-sm text-muted-foreground">Give your AI cybersecurity tutor a custom name.</p>
            </div>
            <div className="flex gap-2">
              <Input
                value={tutorName}
                onChange={(e) => setTutorName(e.target.value)}
                placeholder="e.g. Jarvis, Nova, Echo"
                className="bg-background border-border max-w-xs"
                maxLength={30}
              />
              <Button size="sm" onClick={handleSaveTutorName} disabled={savingName} className="gap-1.5">
                {savingName ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Save
              </Button>
            </div>
          </div>

          {/* Echo */}
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="font-semibold text-foreground">Echo</p>
              <p className="text-sm text-muted-foreground">AI-powered assistant to help you learn and solve challenges.</p>
            </div>
            <Switch checked={echoEnabled} onCheckedChange={handleEchoChange} />
          </div>

          {/* Sound Effects */}
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="font-semibold text-foreground">Sound Effects</p>
              <p className="text-sm text-muted-foreground">Play sound effects throughout the platform.</p>
            </div>
            <Switch checked={soundEffects} onCheckedChange={handleSoundChange} />
          </div>

          {/* Profile Privacy */}
          <div className="flex items-center justify-between py-4 last:pb-0">
            <div>
              <p className="font-semibold text-foreground">Make my profile Private</p>
              <p className="text-sm text-muted-foreground">You can hide your profile from search, leaderboards, and other users.</p>
            </div>
            <Switch checked={isPrivate} onCheckedChange={handlePrivacyChange} disabled={saving} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Preferences;
