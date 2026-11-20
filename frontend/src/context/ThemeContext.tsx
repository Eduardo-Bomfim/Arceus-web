import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ThemeConfig, ThemeId } from '../types';
import { updateDynamicFavicon } from '../utils/favicon';

export const THEMES: ThemeConfig[] = [
  {
    id: 'arceus',
    name: 'Arceus Divino',
    subtitle: 'Roda da Criação • Ouro & Esmeralda',
    primaryColor: '#f59e0b',
    secondaryColor: '#10b981',
    accentBg: 'rgba(245, 158, 11, 0.12)',
    borderAccent: '#f59e0b',
    description: 'Paleta inspirada na aura platina, no anel dourado sagrado e nas gemas esmeralda do Pokémon Alfa.',
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
  },
];

interface ThemeContextType {
  theme: ThemeId;
  themeConfig: ThemeConfig;
  setTheme: (theme: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'arceus_ide_theme';

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
    return 'arceus'; // Arceus como tema padrão
  });

  const setTheme = (newTheme: ThemeId) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    updateDynamicFavicon(theme);
  }, [theme]);

  const themeConfig = THEMES.find((t) => t.id === theme) || THEMES[0];

  return (
    <ThemeContext.Provider value={{ theme, themeConfig, setTheme }}>
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
