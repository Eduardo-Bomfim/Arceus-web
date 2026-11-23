import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ThemeConfig, ThemeId, EditorSettings } from '../types';
import { updateDynamicFavicon } from '../utils/favicon';

export const THEMES: ThemeConfig[] = [
  {
    id: 'jetbrains',
    name: 'JetBrains Dark',
    subtitle: 'New UI • IntelliJ IDEA Modern',
    primaryColor: '#3574f0',
    secondaryColor: '#59a869',
    accentBg: 'rgba(53, 116, 240, 0.12)',
    borderAccent: '#3574f0',
    description: 'Estética oficial do JetBrains New UI (IntelliJ IDEA / Fleet) com grafite escuro e azul assinatura.',
    isDark: true,
    previewColors: ['#1e1f22', '#1e1f22', '#3574f0', '#59a869'],
  },
  {
    id: 'arceus',
    name: 'Arceus Divino',
    subtitle: 'Roda da Criação • Ouro & Esmeralda',
    primaryColor: '#f59e0b',
    secondaryColor: '#10b981',
    accentBg: 'rgba(245, 158, 11, 0.12)',
    borderAccent: '#f59e0b',
    description: 'Paleta inspirada na aura platina, no anel sagrado dourado e nas gemas esmeralda do Pokémon Alfa.',
    isDark: true,
    previewColors: ['#0c1017', '#121824', '#f59e0b', '#10b981'],
  },
  {
    id: 'arceus-light',
    name: 'Luz da Criação',
    subtitle: 'Arceus Radiante • Âmbar Dourado',
    primaryColor: '#d97706',
    secondaryColor: '#059669',
    accentBg: 'rgba(217, 119, 6, 0.12)',
    borderAccent: '#d97706',
    description: 'Tema claro editorial e equilibrado de altíssima legibilidade e conformidade estrita WCAG AA.',
    isDark: false,
    previewColors: ['#f1f5f9', '#ffffff', '#d97706', '#059669'],
  },
  {
    id: 'void',
    name: 'Vácuo Cósmico',
    subtitle: 'Espaço Sideral • Ciano Neon',
    primaryColor: '#38bdf8',
    secondaryColor: '#6366f1',
    accentBg: 'rgba(56, 189, 248, 0.12)',
    borderAccent: '#38bdf8',
    description: 'Ambiente escuro profissional de alto contraste com realces em azul celeste.',
    isDark: true,
    previewColors: ['#0a0e14', '#0f141c', '#38bdf8', '#6366f1'],
  },
  {
    id: 'dialga',
    name: 'Dialga Temporal',
    subtitle: 'Senhor do Tempo • Aço & Diamante',
    primaryColor: '#06b6d4',
    secondaryColor: '#3b82f6',
    accentBg: 'rgba(6, 182, 212, 0.12)',
    borderAccent: '#06b6d4',
    description: 'Tons de azul cobalto, aço metálico e o brilho do diamante do tempo.',
    isDark: true,
    previewColors: ['#060913', '#0b1222', '#06b6d4', '#3b82f6'],
  },
  {
    id: 'giratina',
    name: 'Mundo Distorção',
    subtitle: 'Giratina • Carmesim & Sombra',
    primaryColor: '#f43f5e',
    secondaryColor: '#d97706',
    accentBg: 'rgba(244, 63, 94, 0.12)',
    borderAccent: '#f43f5e',
    description: 'Estética abissal inspirada no Distortion World com detalhes escarlates e ouro sombrio.',
    isDark: true,
    previewColors: ['#0d070a', '#140b0f', '#f43f5e', '#d97706'],
  },
  {
    id: 'palkia',
    name: 'Palkia Dimensional',
    subtitle: 'Espaço Cósmico • Ametista & Fúcsia',
    primaryColor: '#a855f7',
    secondaryColor: '#ec4899',
    accentBg: 'rgba(168, 85, 247, 0.12)',
    borderAccent: '#a855f7',
    description: 'Vibração cósmica com roxo etéreo e destaques em rosa pérola espacial.',
    isDark: true,
    previewColors: ['#0c0614', '#130920', '#a855f7', '#ec4899'],
  },
  {
    id: 'rayquaza',
    name: 'Rayquaza Celeste',
    subtitle: 'Guardião Celeste • Jade & Trovão',
    primaryColor: '#10b981',
    secondaryColor: '#fbbf24',
    accentBg: 'rgba(168, 185, 129, 0.12)',
    borderAccent: '#10b981',
    description: 'Fundo verde jade profundo com runas reluzentes em ouro relâmpago.',
    isDark: true,
    previewColors: ['#040d0a', '#091813', '#10b981', '#fbbf24'],
  },
  {
    id: 'zekrom',
    name: 'Zekrom Ideais & Raios',
    subtitle: 'Noite Elétrica • Preto OLED & Ciano',
    primaryColor: '#00e5ff',
    secondaryColor: '#38bdf8',
    accentBg: 'rgba(0, 229, 255, 0.12)',
    borderAccent: '#00e5ff',
    description: 'Negro absoluto estilo OLED com circuitos em azul elétrico e plasma puro.',
    isDark: true,
    previewColors: ['#000000', '#0a0c10', '#00e5ff', '#38bdf8'],
  },
  {
    id: 'reshiram',
    name: 'Reshiram Chamas',
    subtitle: 'Verdade das Chamas • Branco Solar',
    primaryColor: '#ea580c',
    secondaryColor: '#f59e0b',
    accentBg: 'rgba(234, 88, 12, 0.12)',
    borderAccent: '#ea580c',
    description: 'Estética luminosa pura com chamas em laranja térmico e excelente contraste ergonômico.',
    isDark: false,
    previewColors: ['#f5f5f4', '#ffffff', '#ea580c', '#f59e0b'],
  },
];

export const DEFAULT_SETTINGS: EditorSettings = {
  fontSize: '14px',
  fontFamily: 'JetBrains Mono',
  enableLigatures: true,
  editorLineWrapping: false,
  showMinimap: true,
  optimize: false,
};

interface ThemeContextType {
  theme: ThemeId;
  themeConfig: ThemeConfig;
  setTheme: (theme: ThemeId) => void;
  settings: EditorSettings;
  updateSettings: (newSettings: Partial<EditorSettings>) => void;
  isSettingsOpen: boolean;
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
    return 'jetbrains'; // JetBrains Dark New UI padrão
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

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    updateDynamicFavicon(theme);
  }, [theme]);

  const themeConfig = THEMES.find((t) => t.id === theme) || THEMES[0];

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeConfig,
        setTheme,
        settings,
        updateSettings,
        isSettingsOpen,
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
