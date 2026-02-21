import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Sparkles, RotateCcw } from 'lucide-react';
import AvatarSVG from './AvatarSVG';
import {
  AvatarConfig,
  defaultAvatarConfig,
  skinColors,
  hairColors,
  eyeColors,
  hairStyles,
  eyeStyles,
  noseStyles,
  glassesOptions,
  beardOptions,
  outfitOptions,
  outfitColors,
} from './avatarOptions';

const ColorSwatch = ({ color, selected, onClick, label }: { color: string; selected: boolean; onClick: () => void; label: string }) => (
  <button
    onClick={onClick}
    title={label}
    className={`w-8 h-8 rounded-full border-2 transition-all ${selected ? 'border-primary scale-110 ring-2 ring-primary/30' : 'border-transparent hover:border-muted-foreground/50'}`}
    style={{ backgroundColor: color }}
  />
);

const OptionButton = ({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
  >
    {label}
  </button>
);

const AvatarCustomizer: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [config, setConfig] = useState<AvatarConfig>(defaultAvatarConfig);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('ai_tutor_avatar')
        .eq('user_id', user.id)
        .single();
      if (data?.ai_tutor_avatar) {
        setConfig(data.ai_tutor_avatar as unknown as AvatarConfig);
      }
      setLoaded(true);
    };
    load();
  }, [user]);

  const update = (key: keyof AvatarConfig, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ ai_tutor_avatar: JSON.parse(JSON.stringify(config)) })
        .eq('user_id', user.id);
      if (error) throw error;
      toast({ title: 'Saved!', description: 'Your AI tutor avatar has been saved.' });
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Error', description: 'Failed to save avatar', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const randomize = () => {
    const pick = <T,>(arr: { value: T }[]) => arr[Math.floor(Math.random() * arr.length)].value;
    setConfig({
      gender: Math.random() > 0.5 ? 'male' : 'female',
      skinColor: pick(skinColors),
      hairStyle: pick(hairStyles),
      hairColor: pick(hairColors),
      eyeStyle: pick(eyeStyles),
      eyeColor: pick(eyeColors),
      noseStyle: pick(noseStyles),
      glasses: pick(glassesOptions),
      beard: Math.random() > 0.5 ? pick(beardOptions) : 'none',
      outfit: pick(outfitOptions),
      outfitColor: pick(outfitColors),
    });
  };

  if (!loaded) return null;

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Tutor Avatar
        </CardTitle>
        <CardDescription>Create a personalized avatar for your AI tutor</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Preview */}
          <div className="flex flex-col items-center gap-3 lg:sticky lg:top-4">
            <div className="bg-muted/50 rounded-2xl p-4">
              <AvatarSVG config={config} size={180} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={randomize} className="gap-1">
                <RotateCcw className="h-3.5 w-3.5" /> Random
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1">
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Save
              </Button>
            </div>
          </div>

          {/* Options */}
          <div className="flex-1 min-w-0">
            <Tabs defaultValue="body" className="w-full">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="body">Body</TabsTrigger>
                <TabsTrigger value="face">Face</TabsTrigger>
                <TabsTrigger value="hair">Hair</TabsTrigger>
                <TabsTrigger value="style">Style</TabsTrigger>
              </TabsList>

              <TabsContent value="body" className="space-y-4 mt-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Gender</Label>
                  <div className="flex gap-2">
                    <OptionButton label="Male" selected={config.gender === 'male'} onClick={() => update('gender', 'male')} />
                    <OptionButton label="Female" selected={config.gender === 'female'} onClick={() => update('gender', 'female')} />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Skin Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {skinColors.map(c => <ColorSwatch key={c.value} color={c.value} label={c.label} selected={config.skinColor === c.value} onClick={() => update('skinColor', c.value)} />)}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Outfit</Label>
                  <div className="flex flex-wrap gap-2">
                    {outfitOptions.map(o => <OptionButton key={o.value} label={o.label} selected={config.outfit === o.value} onClick={() => update('outfit', o.value)} />)}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Outfit Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {outfitColors.map(c => <ColorSwatch key={c.value} color={c.value} label={c.label} selected={config.outfitColor === c.value} onClick={() => update('outfitColor', c.value)} />)}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="face" className="space-y-4 mt-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Eye Shape</Label>
                  <div className="flex flex-wrap gap-2">
                    {eyeStyles.map(o => <OptionButton key={o.value} label={o.label} selected={config.eyeStyle === o.value} onClick={() => update('eyeStyle', o.value)} />)}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Eye Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {eyeColors.map(c => <ColorSwatch key={c.value} color={c.value} label={c.label} selected={config.eyeColor === c.value} onClick={() => update('eyeColor', c.value)} />)}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Nose</Label>
                  <div className="flex flex-wrap gap-2">
                    {noseStyles.map(o => <OptionButton key={o.value} label={o.label} selected={config.noseStyle === o.value} onClick={() => update('noseStyle', o.value)} />)}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Glasses</Label>
                  <div className="flex flex-wrap gap-2">
                    {glassesOptions.map(o => <OptionButton key={o.value} label={o.label} selected={config.glasses === o.value} onClick={() => update('glasses', o.value)} />)}
                  </div>
                </div>
                {config.gender === 'male' && (
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Beard</Label>
                    <div className="flex flex-wrap gap-2">
                      {beardOptions.map(o => <OptionButton key={o.value} label={o.label} selected={config.beard === o.value} onClick={() => update('beard', o.value)} />)}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="hair" className="space-y-4 mt-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Hairstyle</Label>
                  <div className="flex flex-wrap gap-2">
                    {hairStyles.map(o => <OptionButton key={o.value} label={o.label} selected={config.hairStyle === o.value} onClick={() => update('hairStyle', o.value)} />)}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Hair Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {hairColors.map(c => <ColorSwatch key={c.value} color={c.value} label={c.label} selected={config.hairColor === c.value} onClick={() => update('hairColor', c.value)} />)}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="style" className="space-y-4 mt-4">
                <div className="text-center p-6 text-muted-foreground">
                  <Sparkles className="h-8 w-8 mx-auto mb-2 text-primary/50" />
                  <p className="text-sm">Mix and match options from Body, Face, and Hair tabs to create your unique AI tutor!</p>
                  <Button variant="outline" className="mt-4 gap-2" onClick={randomize}>
                    <RotateCcw className="h-4 w-4" /> Randomize Everything
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AvatarCustomizer;
