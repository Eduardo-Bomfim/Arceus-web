import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { ThemeConfig, ThemeId, EditorSettings } from '../types';
import { updateDynamicFavicon } from '../utils/favicon';
import {
  ACCENT_PRESETS,
  DEFAULT_SETTINGS,
  THEMES,
  type SettingsTabSection,
} from './themePresets';

interface ThemeContextType {
  theme: ThemeId;
  themeConfig: ThemeConfig;
  setTheme: (theme: ThemeId) => void;
  settings: EditorSettings;
  updateSettings: (newSettings: Partial<EditorSettings>) => void;
  resetSettings: () => void;
  isSettingsOpen: boolean;
  settingsSection: SettingsTabSection;
  openSettings: (section?: SettingsTabSection) => void;
  setIsSettingsOpen: (open: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'arceus_ide_theme';
const SETTINGS_STORAGE_KEY = 'arceus_ide_settings';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId;
      if (saved && THEMES.some((t) => t.id === saved)) {
        return saved;
      }
    } catch {
      // fallback
    }
    return 'jetbrains';
  });

  const [settings, setSettingsState] = useState<EditorSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch {
      // fallback
    }
    return DEFAULT_SETTINGS;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsSection, setSettingsSection] = useState<SettingsTabSection>('appearance');

  const setTheme = (newTheme: ThemeId) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
      // ignore
    }
  };

  const updateSettings = (newSettings: Partial<EditorSettings>) => {
    setSettingsState((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const resetSettings = () => {
    setSettingsState(DEFAULT_SETTINGS);
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
    } catch {
      // ignore
    }
  };

  const openSettings = (section?: SettingsTabSection) => {
    if (section) {
      setSettingsSection(section);
    }
    setIsSettingsOpen(true);
  };

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-density', settings.uiDensity);
    root.setAttribute('data-radius', settings.borderRadius);
    root.setAttribute('data-motion', settings.smoothAnimations ? 'smooth' : 'reduced');

    if (settings.accentOverride !== 'theme' && ACCENT_PRESETS[settings.accentOverride]) {
      const preset = ACCENT_PRESETS[settings.accentOverride];
      root.style.setProperty('--accent-primary', preset.color);
      root.style.setProperty('--accent-glow', preset.glow);
      root.style.setProperty('--border-glow', preset.borderGlow);
    } else {
      root.style.removeProperty('--accent-primary');
      root.style.removeProperty('--accent-glow');
      root.style.removeProperty('--border-glow');
    }

    updateDynamicFavicon(theme);
  }, [theme, settings.accentOverride, settings.uiDensity, settings.borderRadius, settings.smoothAnimations]);

  const themeConfig = useMemo(() => {
    const base = THEMES.find((t) => t.id === theme) || THEMES[0];
    if (settings.accentOverride !== 'theme' && ACCENT_PRESETS[settings.accentOverride]) {
      const preset = ACCENT_PRESETS[settings.accentOverride];
      return {
        ...base,
        primaryColor: preset.color,
        accentBg: preset.glow,
        borderAccent: preset.color,
      };
    }
    return base;
  }, [theme, settings.accentOverride]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeConfig,
        setTheme,
        settings,
        updateSettings,
        resetSettings,
        isSettingsOpen,
        settingsSection,
        openSettings,
        setIsSettingsOpen,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser utilizado dentro de um ThemeProvider');
  }
  return context;
}
