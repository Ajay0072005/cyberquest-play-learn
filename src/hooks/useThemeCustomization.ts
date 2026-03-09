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
  {
    id: 'tryhackme',
    name: 'TryHackMe Green',
    primary: '88 76% 44%',
    accent: '220 26% 22%',
    background: '220 26% 14%',
    card: '220 26% 17%',
    foreground: '0 0% 95%',
  },
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
    id: 'ember',
    name: 'Ember Red',
    primary: '0 72% 51%',
    accent: '0 20% 22%',
    background: '0 15% 12%',
    card: '0 15% 16%',
    foreground: '0 0% 95%',
  },
  {
    id: 'purple',
    name: 'Neon Purple',
    primary: '270 80% 60%',
    accent: '260 25% 22%',
    background: '260 25% 12%',
    card: '260 25% 16%',
    foreground: '0 0% 95%',
  },
  {
    id: 'gold',
    name: 'Gold Rush',
    primary: '45 90% 50%',
    accent: '40 20% 22%',
    background: '40 15% 12%',
    card: '40 15% 16%',
    foreground: '0 0% 95%',
  },
  {
    id: 'cyan',
    name: 'Cyber Cyan',
    primary: '180 80% 45%',
    accent: '185 25% 22%',
    background: '185 25% 12%',
    card: '185 25% 16%',
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
