import { useState, useEffect, useCallback } from 'react';

export interface ThemePreset {
  id: string;
  name: string;
  primary: string;       // HSL values e.g. "88 76% 44%"
  accent: string;
  background: string;
  card: string;
  foreground: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  // Greens
  {
    id: 'tryhackme',
    name: 'Hacker Green',
    primary: '88 76% 44%',
    accent: '220 26% 22%',
    background: '220 26% 14%',
    card: '220 26% 17%',
    foreground: '0 0% 95%',
  },
  {
    id: 'emerald',
    name: 'Emerald',
    primary: '160 84% 39%',
    accent: '160 20% 20%',
    background: '170 20% 11%',
    card: '170 20% 15%',
    foreground: '0 0% 95%',
  },
  {
    id: 'mint',
    name: 'Mint',
    primary: '152 69% 53%',
    accent: '155 20% 20%',
    background: '160 18% 11%',
    card: '160 18% 15%',
    foreground: '0 0% 95%',
  },
  // Blues
  {
    id: 'ocean',
    name: 'Ocean Blue',
    primary: '200 80% 50%',
    accent: '210 30% 22%',
    background: '215 28% 12%',
    card: '215 28% 16%',
    foreground: '0 0% 95%',
  },
  {
    id: 'cobalt',
    name: 'Cobalt',
    primary: '225 73% 57%',
    accent: '225 25% 20%',
    background: '225 25% 11%',
    card: '225 25% 15%',
    foreground: '0 0% 95%',
  },
  {
    id: 'sky',
    name: 'Sky',
    primary: '199 89% 48%',
    accent: '200 25% 20%',
    background: '205 25% 11%',
    card: '205 25% 15%',
    foreground: '0 0% 95%',
  },
  // Reds & Oranges
  {
    id: 'ember',
    name: 'Ember Red',
    primary: '0 72% 51%',
    accent: '0 20% 22%',
    background: '0 15% 12%',
    card: '0 15% 16%',
    foreground: '0 0% 95%',
  },
  {
    id: 'rose',
    name: 'Rose',
    primary: '346 77% 50%',
    accent: '345 20% 20%',
    background: '345 15% 11%',
    card: '345 15% 15%',
    foreground: '0 0% 95%',
  },
  {
    id: 'tangerine',
    name: 'Tangerine',
    primary: '25 95% 53%',
    accent: '25 20% 20%',
    background: '25 15% 11%',
    card: '25 15% 15%',
    foreground: '0 0% 95%',
  },
  // Purples & Pinks
  {
    id: 'purple',
    name: 'Violet',
    primary: '270 80% 60%',
    accent: '260 25% 22%',
    background: '260 25% 12%',
    card: '260 25% 16%',
    foreground: '0 0% 95%',
  },
  {
    id: 'indigo',
    name: 'Indigo',
    primary: '243 75% 59%',
    accent: '240 22% 20%',
    background: '240 22% 11%',
    card: '240 22% 15%',
    foreground: '0 0% 95%',
  },
  {
    id: 'fuchsia',
    name: 'Fuchsia',
    primary: '292 84% 61%',
    accent: '290 22% 20%',
    background: '290 20% 11%',
    card: '290 20% 15%',
    foreground: '0 0% 95%',
  },
  // Warm tones
  {
    id: 'gold',
    name: 'Gold',
    primary: '45 90% 50%',
    accent: '40 20% 22%',
    background: '40 15% 12%',
    card: '40 15% 16%',
    foreground: '0 0% 95%',
  },
  {
    id: 'amber',
    name: 'Amber',
    primary: '38 92% 50%',
    accent: '38 20% 20%',
    background: '35 15% 11%',
    card: '35 15% 15%',
    foreground: '0 0% 95%',
  },
  // Cool tones
  {
    id: 'cyan',
    name: 'Cyan',
    primary: '180 80% 45%',
    accent: '185 25% 22%',
    background: '185 25% 12%',
    card: '185 25% 16%',
    foreground: '0 0% 95%',
  },
  {
    id: 'teal',
    name: 'Teal',
    primary: '173 80% 40%',
    accent: '175 22% 20%',
    background: '175 20% 11%',
    card: '175 20% 15%',
    foreground: '0 0% 95%',
  },
  // Neutrals
  {
    id: 'slate',
    name: 'Slate',
    primary: '215 20% 65%',
    accent: '215 15% 20%',
    background: '220 15% 11%',
    card: '220 15% 15%',
    foreground: '0 0% 95%',
  },
  {
    id: 'zinc',
    name: 'Zinc',
    primary: '240 5% 65%',
    accent: '240 5% 20%',
    background: '240 6% 10%',
    card: '240 6% 14%',
    foreground: '0 0% 95%',
  },
];

const STORAGE_KEY = 'cyberquest_theme';

interface ThemeSettings {
  presetId: string;
  borderRadius: number; // in rem
}

const DEFAULT_SETTINGS: ThemeSettings = {
  presetId: 'tryhackme',
  borderRadius: 0.5,
};

function applyTheme(settings: ThemeSettings) {
  const preset = THEME_PRESETS.find(p => p.id === settings.presetId) || THEME_PRESETS[0];
  const root = document.documentElement;

  root.style.setProperty('--primary', preset.primary);
  root.style.setProperty('--ring', preset.primary);
  root.style.setProperty('--cyber-green', preset.primary);
  root.style.setProperty('--cyber-green-glow', preset.primary);
  root.style.setProperty('--terminal-green', preset.primary);
  root.style.setProperty('--accent', preset.accent);
  root.style.setProperty('--background', preset.background);
  root.style.setProperty('--card', preset.card);
  root.style.setProperty('--popover', preset.card);
  root.style.setProperty('--foreground', preset.foreground);
  root.style.setProperty('--card-foreground', preset.foreground);
  root.style.setProperty('--popover-foreground', preset.foreground);
  root.style.setProperty('--sidebar-primary', preset.primary);
  root.style.setProperty('--radius', `${settings.borderRadius}rem`);
}

export function useThemeCustomization() {
  const [settings, setSettings] = useState<ThemeSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  useEffect(() => {
    applyTheme(settings);
  }, [settings]);

  const setPreset = useCallback((presetId: string) => {
    setSettings(prev => {
      const next = { ...prev, presetId };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const setBorderRadius = useCallback((borderRadius: number) => {
    setSettings(prev => {
      const next = { ...prev, borderRadius };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const resetToDefault = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return {
    currentPresetId: settings.presetId,
    borderRadius: settings.borderRadius,
    setPreset,
    setBorderRadius,
    resetToDefault,
  };
}
