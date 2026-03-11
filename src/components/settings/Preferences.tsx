import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SlidersHorizontal, Loader2, Save, Bot, MapPin, ChevronDown, Palette, RotateCcw, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeCustomization, THEME_PRESETS } from '@/hooks/useThemeCustomization';
import { useTheme } from 'next-themes';

const LOCATIONS = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda',
  'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas',
  'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize',
  'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil',
  'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia',
  'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China',
  'Colombia', 'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba',
  'Cyprus', 'Czech Republic', 'Democratic Republic of the Congo', 'Denmark', 'Djibouti', 'Dominica',
  'Dominican Republic', 'East Timor', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea',
  'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland',
  'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana',
  'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
  'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia',
  'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Ivory Coast',
  'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati',
  'Kosovo', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon',
  'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
  'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta',
  'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova',
  'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar',
  'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua',
  'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman',
  'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay',
  'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania',
  'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa',
  'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles',
  'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia',
  'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan',
  'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan',
  'Tanzania', 'Thailand', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia',
  'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates',
  'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City',
  'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe',
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

  const { currentPresetId, borderRadius, setPreset, setBorderRadius, resetToDefault } = useThemeCustomization();
  const { theme, setTheme } = useTheme();

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
    toast({ title: 'Preference updated', description: `${tutorName} ${checked ? 'enabled' : 'disabled'}` });
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

          {/* AI Assistant Toggle */}
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="font-semibold text-foreground">{tutorName}</p>
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
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="font-semibold text-foreground">Make my profile Private</p>
              <p className="text-sm text-muted-foreground">You can hide your profile from search, leaderboards, and other users.</p>
            </div>
            <Switch checked={isPrivate} onCheckedChange={handlePrivacyChange} disabled={saving} />
          </div>

          {/* Dark Mode */}
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <Moon className="h-4 w-4 text-primary" />
              ) : (
                <Sun className="h-4 w-4 text-primary" />
              )}
              <div>
                <p className="font-semibold text-foreground">Dark Mode</p>
                <p className="text-sm text-muted-foreground">Toggle between light and dark appearance.</p>
              </div>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={(checked) => {
                setTheme(checked ? 'dark' : 'light');
                toast({ title: 'Theme updated', description: checked ? 'Dark mode enabled' : 'Light mode enabled' });
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Theme Customization */}
      <Card className="bg-card border-border">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                Theme Customization
              </p>
              <p className="text-sm text-muted-foreground">Personalize colors and corner roundness</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => { resetToDefault(); toast({ title: 'Theme reset', description: 'Default theme restored' }); }} className="gap-1.5 text-muted-foreground hover:text-foreground">
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          </div>

          {/* Color Palette */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">Color Palette</Label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {THEME_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => { setPreset(preset.id); toast({ title: 'Theme updated', description: `Switched to ${preset.name}` }); }}
                  className={cn(
                    'group flex flex-col items-center gap-2 p-3 rounded-lg border transition-all',
                    currentPresetId === preset.id
                      ? 'border-primary bg-primary/10 ring-1 ring-primary'
                      : 'border-border bg-background hover:border-muted-foreground/40'
                  )}
                >
                  <div
                    className="w-10 h-10 rounded-full shrink-0 shadow-sm ring-2 ring-background"
                    style={{ backgroundColor: `hsl(${preset.primary})` }}
                  />
                  <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground truncate w-full text-center">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Border Radius */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-foreground">Corner Roundness</Label>
              <span className="text-xs text-muted-foreground font-mono">{borderRadius}rem</span>
            </div>
            <Slider
              value={[borderRadius]}
              onValueChange={([v]) => setBorderRadius(v)}
              min={0}
              max={1.5}
              step={0.125}
              className="w-full"
            />
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-8 h-6 border border-border bg-muted/30" style={{ borderRadius: '0px' }} />
                Sharp
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground ml-auto">
                <div className="w-8 h-6 border border-border bg-muted/30" style={{ borderRadius: '12px' }} />
                Rounded
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Preview</Label>
            <div className="p-4 rounded-lg border border-border bg-background">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center" style={{ borderRadius: `calc(${borderRadius}rem - 2px)` }}>
                  <Palette className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Sample Card</p>
                  <p className="text-xs text-muted-foreground">This is how your UI elements will look</p>
                </div>
                <Button size="sm" style={{ borderRadius: `calc(${borderRadius}rem - 2px)` }}>
                  Button
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Preferences;
