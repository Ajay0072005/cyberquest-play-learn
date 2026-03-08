import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SlidersHorizontal, Loader2, Save, Bot, MapPin, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const LOCATIONS = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France',
  'India', 'Japan', 'South Korea', 'Brazil', 'Netherlands', 'Singapore',
  'Sweden', 'Switzerland', 'Israel', 'Spain', 'Italy', 'Mexico',
  'South Africa', 'Nigeria', 'Kenya', 'UAE', 'Saudi Arabia', 'Poland',
  'Turkey', 'Indonesia', 'Philippines', 'Vietnam', 'Thailand', 'Malaysia',
  'China', 'Russia', 'Ukraine', 'Romania', 'Czech Republic', 'Portugal',
  'Argentina', 'Colombia', 'Chile', 'Egypt', 'Pakistan', 'Bangladesh',
  'New Zealand', 'Ireland', 'Norway', 'Denmark', 'Finland', 'Belgium',
  'Austria', 'Hungary',
];

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
  const [location, setLocation] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [savingLocation, setSavingLocation] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);

  const filteredLocations = LOCATIONS.filter(l =>
    l.toLowerCase().includes(locationInput.toLowerCase())
  );

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_public, ai_tutor_name, location')
          .eq('user_id', user.id)
          .single();
        if (error && error.code !== 'PGRST116') throw error;
        if (data) {
          setIsPrivate(!(data.is_public ?? false));
          setTutorName((data as any).ai_tutor_name || 'CyberBot');
          setLocation(data.location || '');
          setLocationInput(data.location || '');
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

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setShowLocationDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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

  const handleSelectLocation = (loc: string) => {
    setLocationInput(loc);
    setShowLocationDropdown(false);
  };

  const handleSaveLocation = async () => {
    if (!user) return;
    setSavingLocation(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ user_id: user.id, location: locationInput.trim() || null } as any, { onConflict: 'user_id' });
      if (error) throw error;
      setLocation(locationInput.trim());
      toast({ title: 'Preference updated', description: `Location set to "${locationInput.trim() || 'None'}"` });
    } catch (error) {
      console.error('Error updating location:', error);
      toast({ title: 'Error', description: 'Failed to update location', variant: 'destructive' });
    } finally {
      setSavingLocation(false);
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

          {/* Location */}
          <div className="py-4 space-y-3">
            <div>
              <p className="font-semibold text-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Location
              </p>
              <p className="text-sm text-muted-foreground">Select your country or type a custom location.</p>
            </div>
            <div className="flex gap-2" ref={locationRef}>
              <div className="relative max-w-xs w-full">
                <Input
                  value={locationInput}
                  onChange={(e) => { setLocationInput(e.target.value); setShowLocationDropdown(true); }}
                  onFocus={() => setShowLocationDropdown(true)}
                  placeholder="e.g. India, United States"
                  className="bg-background border-border pr-8"
                />
                <button
                  type="button"
                  onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <ChevronDown className={cn("h-4 w-4 transition-transform", showLocationDropdown && "rotate-180")} />
                </button>
                {showLocationDropdown && filteredLocations.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full max-h-48 overflow-auto rounded-md border border-border bg-popover text-popover-foreground shadow-md">
                    {filteredLocations.map(loc => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => handleSelectLocation(loc)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button size="sm" onClick={handleSaveLocation} disabled={savingLocation} className="gap-1.5">
                {savingLocation ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
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
