import React, { useState, useEffect } from 'react';
import {
  X,
  Palette,
  Type,
  Keyboard,
  Check,
  Settings as SettingsIcon,
  Zap,
  Play,
  Terminal as TerminalIcon,
  RotateCcw,
  Sliders,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { ACCENT_PRESETS, THEMES } from '../context/themePresets';
import type { SettingsTabSection } from '../context/themePresets';
import { useToast } from '../context/ToastContext';
import type {
  AccentOverride,
  BorderRadiusStyle,
  EditorFontFamily,
  EditorFontSize,
  EditorLineHeight,
  SidebarPosition,
  TabSize,
  TerminalCursorStyle,
  TerminalFontSize,
  ThemeId,
  UiDensity,
} from '../types';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  optimize: boolean;
  onToggleOptimize: (enabled: boolean) => void;
}

interface ThemePreviewPalette {
  bgApp: string;
  bgSurface: string;
  bgPanel: string;
  border: string;
  accentPrimary: string;
  accentSecondary: string;
  textMain: string;
  textMuted: string;
  keyword: string;
}

function getThemePreviewPalette(
  themeId: ThemeId,
  accentOverride: AccentOverride
): ThemePreviewPalette {
  const palettes: Record<ThemeId, ThemePreviewPalette> = {
    jetbrains: {
      bgApp: '#141518',
      bgSurface: '#1b1c20',
      bgPanel: '#17181c',
      border: '#292b32',
      accentPrimary: '#3574f0',
      accentSecondary: '#59a869',
      textMain: '#e3e5e9',
      textMuted: '#848994',
      keyword: '#cf8e6d',
    },
    arceus: {
      bgApp: '#090c12',
      bgSurface: '#111622',
      bgPanel: '#0d111a',
      border: '#1f2b3e',
      accentPrimary: '#f59e0b',
      accentSecondary: '#10b981',
      textMain: '#f4f6fa',
      textMuted: '#8f9bb0',
      keyword: '#fbbf24',
    },
    'arceus-light': {
      bgApp: '#eef2f6',
      bgSurface: '#ffffff',
      bgPanel: '#f7f9fc',
      border: '#d7e0eb',
      accentPrimary: '#d97706',
      accentSecondary: '#059669',
      textMain: '#0f172a',
      textMuted: '#64748b',
      keyword: '#b45309',
    },
    void: {
      bgApp: '#080b10',
      bgSurface: '#0f141d',
      bgPanel: '#0b0f17',
      border: '#1d2738',
      accentPrimary: '#38bdf8',
      accentSecondary: '#34d399',
      textMain: '#edf2f8',
      textMuted: '#8695aa',
      keyword: '#38bdf8',
    },
    dialga: {
      bgApp: '#050811',
      bgSurface: '#0b1221',
      bgPanel: '#080d19',
      border: '#18294a',
      accentPrimary: '#06b6d4',
      accentSecondary: '#3b82f6',
      textMain: '#eff8ff',
      textMuted: '#76b6d8',
      keyword: '#06b6d4',
    },
    giratina: {
      bgApp: '#0a0608',
      bgSurface: '#130b0f',
      bgPanel: '#0e080b',
      border: '#301923',
      accentPrimary: '#f43f5e',
      accentSecondary: '#d97706',
      textMain: '#fdf2f4',
      textMuted: '#c28e99',
      keyword: '#f43f5e',
    },
    palkia: {
      bgApp: '#090510',
      bgSurface: '#12091e',
      bgPanel: '#0d0716',
      border: '#2d184a',
      accentPrimary: '#a855f7',
      accentSecondary: '#ec4899',
      textMain: '#f9f5ff',
      textMuted: '#ab86d9',
      keyword: '#c084fc',
    },
    rayquaza: {
      bgApp: '#030a08',
      bgSurface: '#091712',
      bgPanel: '#06110d',
      border: '#193e30',
      accentPrimary: '#10b981',
      accentSecondary: '#fbbf24',
      textMain: '#ecfdf5',
      textMuted: '#6cb899',
      keyword: '#34d399',
    },
    zekrom: {
      bgApp: '#000000',
      bgSurface: '#090b10',
      bgPanel: '#040508',
      border: '#1c2433',
      accentPrimary: '#00e5ff',
      accentSecondary: '#38bdf8',
      textMain: '#f8fafc',
      textMuted: '#8492a6',
      keyword: '#00e5ff',
    },
    reshiram: {
      bgApp: '#efeeec',
      bgSurface: '#ffffff',
      bgPanel: '#f7f6f4',
      border: '#dbd8d3',
      accentPrimary: '#ea580c',
      accentSecondary: '#d97706',
      textMain: '#1c1917',
      textMuted: '#78716c',
      keyword: '#ea580c',
    },
  };

  const base = palettes[themeId] || palettes.jetbrains;
  if (accentOverride !== 'theme' && ACCENT_PRESETS[accentOverride]) {
    return { ...base, accentPrimary: ACCENT_PRESETS[accentOverride].color };
  }
  return base;
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-3 rounded-[var(--ui-radius)] border border-[var(--border-subtle)] bg-[var(--bg-surface-soft)]">
      <div className="min-w-0">
        <div className="font-medium text-xs text-[var(--text-main)]">{title}</div>
        <div className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-snug">
          {description}
        </div>
      </div>

      <label className="relative inline-flex items-center cursor-pointer shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-9 h-5 bg-[var(--bg-subtle)] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--accent-primary)]" />
      </label>
    </div>
  );
}

function IdeThemePreview({ themeId }: { themeId: ThemeId }) {
  const { settings } = useTheme();
  const p = getThemePreviewPalette(themeId, settings.accentOverride);
  const currentTheme = THEMES.find((t) => t.id === themeId) || THEMES[0];
  const radius =
    settings.borderRadius === 'sharp'
      ? '4px'
      : settings.borderRadius === 'pill'
      ? '10px'
      : '7px';

  const sidebarBlock = (
    <div
      className="w-24 p-1.5 text-[9px] flex flex-col gap-1 shrink-0 border"
      style={{
        backgroundColor: p.bgPanel,
        borderColor: p.border,
        color: p.textMuted,
        borderRadius: radius,
      }}
    >
      <div className="text-[8px] uppercase tracking-wider opacity-60 px-1">
        Explorador
      </div>
      <div
        className="flex items-center gap-1.5 px-1.5 py-1 font-mono"
        style={{
          backgroundColor: `${p.accentPrimary}22`,
          color: p.textMain,
          borderRadius: radius,
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: p.accentPrimary }}
        />
        <span className="truncate">principal.ml</span>
      </div>
      <div className="flex items-center gap-1.5 px-1.5 py-0.5 font-mono opacity-65">
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-40 shrink-0" />
        <span className="truncate">math.ml</span>
      </div>
    </div>
  );

  return (
    <div
      className="border overflow-hidden shadow-lg transition-all select-none p-1.5 flex flex-col gap-1.5"
      style={{
        backgroundColor: p.bgApp,
        borderColor: p.border,
        borderRadius: radius,
      }}
    >
      {/* Topbar Limpa da Prévia */}
      <div
        className="h-7 px-2 flex items-center justify-between text-[9.5px]"
        style={{ color: p.textMuted }}
      >
        <div className="flex items-center gap-1.5">
          <span
            className="w-3 h-3 rounded-full border-2 flex items-center justify-center"
            style={{ borderColor: p.accentPrimary }}
          >
            <span
              className="w-1 h-1 rounded-full"
              style={{ backgroundColor: p.accentPrimary }}
            />
          </span>
          <span className="font-semibold" style={{ color: p.textMain }}>
            Arceus
          </span>
        </div>

        <div
          className="px-3 py-0.5 border text-[8.5px] opacity-80"
          style={{
            backgroundColor: p.bgSurface,
            borderColor: p.border,
            borderRadius: radius,
          }}
        >
          Buscar comandos...
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className="flex items-center gap-1 px-1.5 py-0.5 font-semibold text-[8.5px]"
            style={{
              backgroundColor: `${p.accentSecondary}22`,
              color: p.accentSecondary,
              borderRadius: radius,
            }}
          >
            <Play className="w-2 h-2 fill-current" />
            Executar
          </span>
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: p.accentSecondary }}
          />
        </div>
      </div>

      {/* Área principal em ilhas */}
      <div className="flex gap-1.5 h-36">
        {settings.sidebarPosition === 'left' && sidebarBlock}

        <div className="flex-1 flex flex-col gap-1.5 min-w-0">
          {/* Card do Editor */}
          <div
            className="flex-1 flex flex-col overflow-hidden border"
            style={{
              backgroundColor: p.bgSurface,
              borderColor: p.border,
              borderRadius: radius,
            }}
          >
            <div
              className="h-5 px-2 border-b flex items-center justify-between text-[8.5px]"
              style={{ backgroundColor: p.bgPanel, borderColor: p.border }}
            >
              <span
                className="px-1.5 py-0.5 font-mono"
                style={{
                  backgroundColor: p.bgSurface,
                  color: p.textMain,
                  borderRadius: '4px',
                }}
              >
                principal.ml
              </span>
              <span style={{ color: p.accentPrimary }}>Formatar</span>
            </div>

            {settings.showBreadcrumbs && (
              <div
                className="h-4 px-2 border-b flex items-center text-[8px] font-mono"
                style={{ borderColor: p.border, color: p.textMuted }}
              >
                principal.ml › programa demo
              </div>
            )}

            <div
              className="flex-1 p-2 font-mono text-[9px] leading-relaxed"
              style={{ color: p.textMain }}
            >
              <div>
                {settings.showLineNumbers && (
                  <span className="opacity-35 mr-2">1</span>
                )}
                <span style={{ color: p.keyword, fontWeight: 600 }}>programa</span>{' '}
                demo {'{'}
              </div>
              <div>
                {settings.showLineNumbers && (
                  <span className="opacity-35 mr-2">2</span>
                )}
                {'  '}
                <span style={{ color: p.keyword }}>var</span> x{' '}
                <span style={{ color: p.accentPrimary }}>inteiro</span>; x = 42;
              </div>
              <div>
                {settings.showLineNumbers && (
                  <span className="opacity-35 mr-2">3</span>
                )}
                {'}'} <span style={{ color: p.keyword }}>fim.</span>
              </div>
            </div>
          </div>

          {/* Card do Terminal Interativo */}
          <div
            className="h-12 border p-1.5 font-mono text-[8.5px] flex flex-col justify-center"
            style={{
              backgroundColor: p.bgSurface,
              borderColor: p.border,
              color: p.textMuted,
              borderRadius: radius,
            }}
          >
            <div>
              <span style={{ color: p.accentPrimary }}>~/src $</span>{' '}
              <span style={{ color: p.textMain }}>arceus run</span>
            </div>
            <div style={{ color: p.accentSecondary }}>42 • código 0 (9 ms)</div>
          </div>
        </div>

        {settings.sidebarPosition === 'right' && sidebarBlock}
      </div>

      {/* StatusBar minimalista opcional */}
      {settings.showStatusBar && (
        <div
          className="h-4 px-2 flex items-center justify-between text-[8px]"
          style={{ color: p.textMuted }}
        >
          <span>Nenhum problema • Terminal</span>
          <span>
            Ln 2, Col 10 • {currentTheme.name}
          </span>
        </div>
      )}
    </div>
  );
}

function SettingsDialogContent({
  onClose,
  optimize,
  onToggleOptimize,
}: Omit<SettingsDrawerProps, 'isOpen'>) {
  const {
    theme,
    setTheme,
    settings,
    updateSettings,
    resetSettings,
    settingsSection,
  } = useTheme();
  const { showToast } = useToast();

  const [activeSection, setActiveSection] = useState<SettingsTabSection>(settingsSection);
  const [hoveredTheme, setHoveredTheme] = useState<ThemeId | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const currentPreviewTheme = hoveredTheme || theme;

  const navItems: Array<{
    id: SettingsTabSection;
    label: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'appearance',
      label: 'Aparência e Temas',
      icon: <Palette className="w-3.5 h-3.5 text-[var(--accent-primary)]" />,
    },
    {
      id: 'editor',
      label: 'Editor de Código',
      icon: <Type className="w-3.5 h-3.5 text-[var(--accent-secondary)]" />,
    },
    {
      id: 'terminal',
      label: 'Terminal Interativo',
      icon: <TerminalIcon className="w-3.5 h-3.5 text-sky-400" />,
    },
    {
      id: 'compiler',
      label: 'Compilador e Execução',
      icon: <Zap className="w-3.5 h-3.5 text-amber-400" />,
    },
    {
      id: 'keymap',
      label: 'Atalhos e Sistema',
      icon: <Keyboard className="w-3.5 h-3.5 text-purple-400" />,
    },
  ];

  const handleReset = () => {
    resetSettings();
    onToggleOptimize(false);
    showToast('Configurações restauradas para o padrão.', 'info');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl h-[680px] max-h-[90vh] bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-[var(--ui-radius-lg)] shadow-2xl flex flex-col overflow-hidden text-xs text-[var(--text-main)] transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-11 px-4 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <SettingsIcon className="w-4 h-4 text-[var(--accent-primary)]" />
            <span className="font-semibold text-sm text-[var(--text-main)]">
              Configurações da IDE
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-[var(--ui-radius)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] transition"
            title="Fechar (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corpo */}
        <div className="flex-1 flex overflow-hidden">
          {/* Navegação Lateral */}
          <nav className="w-56 bg-[var(--bg-app)] border-r border-[var(--border-subtle)] p-2.5 flex flex-col justify-between shrink-0 overflow-y-auto">
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[var(--ui-radius)] text-xs transition text-left ${
                      isActive
                        ? 'bg-[var(--accent-soft)] text-[var(--text-main)] font-semibold'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle-soft)]'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-3 py-2 rounded-[var(--ui-radius)] text-[11px] text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/10 transition mt-4"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar padrões</span>
            </button>
          </nav>

          {/* Conteúdo */}
          <div className="flex-1 bg-[var(--bg-panel)] p-6 overflow-y-auto space-y-6">
            {/* 1. APARÊNCIA & TEMAS */}
            {activeSection === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-main)]">
                    Aparência e Esquema de Cores
                  </h3>
                  <p className="text-[11.5px] text-[var(--text-muted)] mt-0.5">
                    Personalize cores, densidade visual, arredondamento e visibilidade da interface.
                  </p>
                </div>

                {/* Prévia Visual em Tempo Real */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium text-[var(--text-main)]">
                      Prévia em tempo real
                    </span>
                    <span className="text-[var(--text-muted)] font-mono text-[10.5px]">
                      {hoveredTheme
                        ? `Visualizando: ${THEMES.find((t) => t.id === hoveredTheme)?.name}`
                        : `Ativo: ${THEMES.find((t) => t.id === theme)?.name}`}
                    </span>
                  </div>
                  <IdeThemePreview themeId={currentPreviewTheme} />
                </div>

                {/* Grid de Temas */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-[var(--text-main)]">Temas</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {THEMES.map((t) => {
                      const isSelected = theme === t.id;
                      const [cBg, cSurface, cPrimary, cAccent] = t.previewColors;

                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setTheme(t.id)}
                          onMouseEnter={() => setHoveredTheme(t.id)}
                          onMouseLeave={() => setHoveredTheme(null)}
                          className={`p-3 rounded-[var(--ui-radius)] border text-left transition flex flex-col justify-between ${
                            isSelected
                              ? 'border-[var(--accent-primary)] bg-[var(--bg-surface)] shadow-sm'
                              : 'border-[var(--border-subtle)] bg-[var(--bg-surface-soft)] hover:border-[var(--accent-border)] hover:bg-[var(--bg-surface)]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-xs text-[var(--text-main)]">
                              {t.name}
                            </span>
                            {isSelected && (
                              <span className="w-4 h-4 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </span>
                            )}
                          </div>

                          <p className="text-[11px] text-[var(--text-muted)] line-clamp-1 mb-2.5">
                            {t.subtitle}
                          </p>

                          <div className="flex items-center gap-1.5 w-full">
                            <span className="w-3.5 h-3.5 rounded-full border border-black/25" style={{ backgroundColor: cBg }} />
                            <span className="w-3.5 h-3.5 rounded-full border border-black/25" style={{ backgroundColor: cSurface }} />
                            <span className="w-3.5 h-3.5 rounded-full border border-black/25" style={{ backgroundColor: cPrimary }} />
                            <span className="w-3.5 h-3.5 rounded-full border border-black/25" style={{ backgroundColor: cAccent }} />
                            <span className="text-[10px] ml-auto font-mono text-[var(--text-muted)]">
                              {t.isDark ? 'Escuro' : 'Claro'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Cor de Destaque (Accent Override) */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-[var(--text-main)]">
                    Cor de Destaque
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => updateSettings({ accentOverride: 'theme' })}
                      className={`px-3 py-1.5 rounded-[var(--ui-radius)] border text-xs transition flex items-center gap-2 ${
                        settings.accentOverride === 'theme'
                          ? 'border-[var(--accent-primary)] bg-[var(--bg-surface)] text-[var(--text-main)] font-medium'
                          : 'border-[var(--border-subtle)] bg-[var(--bg-surface-soft)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                      }`}
                    >
                      <Sliders className="w-3 h-3" />
                      <span>Padrão do Tema</span>
                    </button>

                    {(Object.keys(ACCENT_PRESETS) as Array<Exclude<AccentOverride, 'theme'>>).map(
                      (key) => {
                        const preset = ACCENT_PRESETS[key];
                        const active = settings.accentOverride === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => updateSettings({ accentOverride: key })}
                            className={`px-3 py-1.5 rounded-[var(--ui-radius)] border text-xs transition flex items-center gap-2 ${
                              active
                                ? 'border-[var(--accent-primary)] bg-[var(--bg-surface)] text-[var(--text-main)] font-medium'
                                : 'border-[var(--border-subtle)] bg-[var(--bg-surface-soft)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                            }`}
                          >
                            <span
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{ backgroundColor: preset.color }}
                            />
                            <span>{preset.label}</span>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* Densidade, Arredondamento & Posição */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[var(--text-main)]">
                      Densidade Visual
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {(
                        [
                          ['compact', 'Compacta'],
                          ['comfortable', 'Padrão'],
                          ['spacious', 'Ampla'],
                        ] as Array<[UiDensity, string]>
                      ).map(([val, lbl]) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => updateSettings({ uiDensity: val })}
                          className={`py-1.5 px-2 rounded-[var(--ui-radius)] border text-[11px] transition ${
                            settings.uiDensity === val
                              ? 'border-[var(--accent-primary)] bg-[var(--bg-surface)] text-[var(--accent-primary)] font-semibold'
                              : 'border-[var(--border-subtle)] bg-[var(--bg-surface-soft)] text-[var(--text-muted)]'
                          }`}
                        >
                          {lbl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[var(--text-main)]">
                      Cantos e Bordas
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {(
                        [
                          ['sharp', 'Retos'],
                          ['rounded', 'Suaves'],
                          ['pill', 'Redondos'],
                        ] as Array<[BorderRadiusStyle, string]>
                      ).map(([val, lbl]) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => updateSettings({ borderRadius: val })}
                          className={`py-1.5 px-2 rounded-[var(--ui-radius)] border text-[11px] transition ${
                            settings.borderRadius === val
                              ? 'border-[var(--accent-primary)] bg-[var(--bg-surface)] text-[var(--accent-primary)] font-semibold'
                              : 'border-[var(--border-subtle)] bg-[var(--bg-surface-soft)] text-[var(--text-muted)]'
                          }`}
                        >
                          {lbl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[var(--text-main)]">
                      Lado do Explorador
                    </label>
                    <div className="grid grid-cols-2 gap-1">
                      {(
                        [
                          ['left', 'Esquerda'],
                          ['right', 'Direita'],
                        ] as Array<[SidebarPosition, string]>
                      ).map(([val, lbl]) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => updateSettings({ sidebarPosition: val })}
                          className={`py-1.5 px-2 rounded-[var(--ui-radius)] border text-[11px] transition ${
                            settings.sidebarPosition === val
                              ? 'border-[var(--accent-primary)] bg-[var(--bg-surface)] text-[var(--accent-primary)] font-semibold'
                              : 'border-[var(--border-subtle)] bg-[var(--bg-surface-soft)] text-[var(--text-muted)]'
                          }`}
                        >
                          {lbl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Elementos da Interface */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-[var(--text-main)]">
                    Elementos da Interface
                  </div>
                  <div className="space-y-2">
                    <ToggleRow
                      title="Exibir Breadcrumbs de Escopo"
                      description="Mostra o caminho do arquivo e blocos ativos (programa, se, enquanto) acima do código."
                      checked={settings.showBreadcrumbs}
                      onChange={(val) => updateSettings({ showBreadcrumbs: val })}
                    />
                    <ToggleRow
                      title="Exibir Barra de Status Inferior"
                      description="Mostra contagem de erros, linha/coluna do cursor, indentação e tema atual."
                      checked={settings.showStatusBar}
                      onChange={(val) => updateSettings({ showStatusBar: val })}
                    />
                    <ToggleRow
                      title="Transições e Animações Suaves"
                      description="Suaviza trocas de tema, foco e abertura de painéis."
                      checked={settings.smoothAnimations}
                      onChange={(val) => updateSettings({ smoothAnimations: val })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. EDITOR DE CÓDIGO */}
            {activeSection === 'editor' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-main)]">
                    Editor de Código MiniLang
                  </h3>
                  <p className="text-[11.5px] text-[var(--text-muted)] mt-0.5">
                    Ajuste tipografia, espaçamento, auxiliares de edição e comportamento visual.
                  </p>
                </div>

                {/* Família da Fonte */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[var(--text-main)]">
                    Família da Fonte
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {(
                      [
                        ['JetBrains Mono', 'JetBrains Mono'],
                        ['Fira Code', 'Fira Code'],
                        ['monospace', 'Monospace Padrão'],
                      ] as Array<[EditorFontFamily, string]>
                    ).map(([font, label]) => (
                      <button
                        key={font}
                        type="button"
                        onClick={() => updateSettings({ fontFamily: font })}
                        className={`p-3 rounded-[var(--ui-radius)] border text-left transition ${
                          settings.fontFamily === font
                            ? 'border-[var(--accent-primary)] bg-[var(--bg-surface)] text-[var(--text-main)] font-semibold'
                            : 'border-[var(--border-subtle)] bg-[var(--bg-surface-soft)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                        }`}
                      >
                        <div className="text-xs">{label}</div>
                        <div className="text-[11px] mt-1 opacity-75 font-mono" style={{ fontFamily: font }}>
                          x != 0 =&gt; escreva x;
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tamanho, Altura e Indentação */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-[var(--text-main)]">
                      Tamanho da Fonte
                    </label>
                    <div className="grid grid-cols-6 gap-1.5">
                      {(['12px', '13px', '14px', '16px', '18px', '20px'] as EditorFontSize[]).map(
                        (size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => updateSettings({ fontSize: size })}
                            className={`py-1.5 px-2 rounded-[var(--ui-radius)] border font-mono text-center transition ${
                              settings.fontSize === size
                                ? 'border-[var(--accent-primary)] bg-[var(--bg-surface)] text-[var(--accent-primary)] font-bold'
                                : 'border-[var(--border-subtle)] bg-[var(--bg-surface-soft)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                            }`}
                          >
                            {size}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text-main)]">
                      Indentação (Tab)
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {([2, 4] as TabSize[]).map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => updateSettings({ tabSize: tab })}
                          className={`py-1.5 px-2 rounded-[var(--ui-radius)] border font-mono text-center transition ${
                            settings.tabSize === tab
                              ? 'border-[var(--accent-primary)] bg-[var(--bg-surface)] text-[var(--accent-primary)] font-bold'
                              : 'border-[var(--border-subtle)] bg-[var(--bg-surface-soft)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                          }`}
                        >
                          {tab} esp.
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Altura da Linha */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-main)]">
                    Espaçamento Entre Linhas
                  </label>
                  <div className="grid grid-cols-3 gap-2 max-w-xs">
                    {(
                      [
                        ['1.4', '1.4 (Justo)'],
                        ['1.6', '1.6 (Padrão)'],
                        ['1.8', '1.8 (Aberto)'],
                      ] as Array<[EditorLineHeight, string]>
                    ).map(([lh, label]) => (
                      <button
                        key={lh}
                        type="button"
                        onClick={() => updateSettings({ lineHeight: lh })}
                        className={`py-1.5 px-2 rounded-[var(--ui-radius)] border text-[11px] transition ${
                          settings.lineHeight === lh
                            ? 'border-[var(--accent-primary)] bg-[var(--bg-surface)] text-[var(--accent-primary)] font-semibold'
                            : 'border-[var(--border-subtle)] bg-[var(--bg-surface-soft)] text-[var(--text-muted)]'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggles do Editor */}
                <div className="space-y-2 pt-1">
                  <ToggleRow
                    title="Ligaduras Tipográficas"
                    description="Une combinações de caracteres como ==, !=, >= e <= em glifos contínuos."
                    checked={settings.enableLigatures}
                    onChange={(val) => updateSettings({ enableLigatures: val })}
                  />
                  <ToggleRow
                    title="Numeração de Linhas"
                    description="Exibe a coluna lateral com números de linha e marcadores de dobra."
                    checked={settings.showLineNumbers}
                    onChange={(val) => updateSettings({ showLineNumbers: val })}
                  />
                  <ToggleRow
                    title="Destacar Linha Atual"
                    description="Realça sutilmente a linha onde o cursor de texto está posicionado."
                    checked={settings.highlightActiveLine}
                    onChange={(val) => updateSettings({ highlightActiveLine: val })}
                  />
                  <ToggleRow
                    title="Fechar Chaves e Parênteses Automaticamente"
                    description="Completa pares de { }, ( ) e aspas automaticamente ao digitar."
                    checked={settings.closeBrackets}
                    onChange={(val) => updateSettings({ closeBrackets: val })}
                  />
                  <ToggleRow
                    title="Quebra Automática de Linha (Soft-Wrap)"
                    description="Quebra linhas longas na largura do editor sem barra de rolagem horizontal."
                    checked={settings.editorLineWrapping}
                    onChange={(val) => updateSettings({ editorLineWrapping: val })}
                  />
                  <ToggleRow
                    title="Exibir Minimapa de Código"
                    description="Mostra uma miniatura lateral do arquivo no canto direito do editor."
                    checked={settings.showMinimap}
                    onChange={(val) => updateSettings({ showMinimap: val })}
                  />
                </div>
              </div>
            )}

            {/* 3. TERMINAL INTERATIVO */}
            {activeSection === 'terminal' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-main)]">
                    Terminal Interativo & Console
                  </h3>
                  <p className="text-[11.5px] text-[var(--text-muted)] mt-0.5">
                    Configure a aparência do prompt de comandos e comportamento durante execuções.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text-main)]">
                      Tamanho da Fonte do Terminal
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {(['11px', '12px', '13px', '14px'] as TerminalFontSize[]).map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => updateSettings({ terminalFontSize: size })}
                          className={`py-1.5 px-2 rounded-[var(--ui-radius)] border font-mono text-center transition ${
                            settings.terminalFontSize === size
                              ? 'border-[var(--accent-primary)] bg-[var(--bg-surface)] text-[var(--accent-primary)] font-bold'
                              : 'border-[var(--border-subtle)] bg-[var(--bg-surface-soft)] text-[var(--text-muted)]'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text-main)]">
                      Estilo do Cursor
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(
                        [
                          ['bar', 'Barra |'],
                          ['block', 'Bloco ▋'],
                          ['underline', 'Linha _'],
                        ] as Array<[TerminalCursorStyle, string]>
                      ).map(([styleVal, lbl]) => (
                        <button
                          key={styleVal}
                          type="button"
                          onClick={() => updateSettings({ terminalCursorStyle: styleVal })}
                          className={`py-1.5 px-2 rounded-[var(--ui-radius)] border text-[11px] font-mono transition ${
                            settings.terminalCursorStyle === styleVal
                              ? 'border-[var(--accent-primary)] bg-[var(--bg-surface)] text-[var(--accent-primary)] font-semibold'
                              : 'border-[var(--border-subtle)] bg-[var(--bg-surface-soft)] text-[var(--text-muted)]'
                          }`}
                        >
                          {lbl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <ToggleRow
                    title="Quebra de Linha no Terminal"
                    description="Ajusta linhas longas de saída e tabelas automaticamente à largura do painel."
                    checked={settings.terminalWrap}
                    onChange={(val) => updateSettings({ terminalWrap: val })}
                  />
                  <ToggleRow
                    title="Exibir Carimbo de Hora (Timestamps)"
                    description="Adiciona o horário [HH:MM:SS] ao lado de comandos e saídas no terminal."
                    checked={settings.terminalTimestamps}
                    onChange={(val) => updateSettings({ terminalTimestamps: val })}
                  />
                  <ToggleRow
                    title="Limpar Terminal Antes de Executar (F9)"
                    description="Apaga comandos e logs anteriores automaticamente ao clicar no botão Executar."
                    checked={settings.clearBeforeRun}
                    onChange={(val) => updateSettings({ clearBeforeRun: val })}
                  />
                </div>
              </div>
            )}

            {/* 4. COMPILADOR & EXECUÇÃO */}
            {activeSection === 'compiler' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-main)]">
                    Compilador & Otimizador
                  </h3>
                  <p className="text-[11.5px] text-[var(--text-muted)] mt-0.5">
                    Controle a flag de otimização Constant Folding, análise em tempo real e limites do interpretador.
                  </p>
                </div>

                {/* Constant Folding Card */}
                <div className="p-4 rounded-[var(--ui-radius)] border border-[var(--border-subtle)] bg-[var(--bg-surface-soft)] flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span className="font-semibold text-xs text-[var(--text-main)]">
                        Constant Folding (--opt)
                      </span>
                      <span
                        className={`text-[9.5px] px-1.5 py-0.2 rounded font-mono font-bold ${
                          optimize
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-[var(--bg-subtle)] text-[var(--text-muted)]'
                        }`}
                      >
                        {optimize ? 'ATIVADO' : 'DESATIVADO'}
                      </span>
                    </div>
                    <p className="text-[11.5px] text-[var(--text-muted)] leading-relaxed">
                      Avalia e dobra expressões constantes na AST em tempo de compilação (por exemplo,{' '}
                      <code className="text-amber-400 font-mono">10 + 20 * 2</code> é reduzido diretamente para{' '}
                      <code className="text-[var(--accent-secondary)] font-mono">50</code> antes da execução).
                    </p>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0 pt-0.5">
                    <input
                      type="checkbox"
                      checked={optimize}
                      onChange={(e) => onToggleOptimize(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-[var(--bg-subtle)] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--accent-primary)]" />
                  </label>
                </div>

                {/* Análise Automática */}
                <ToggleRow
                  title="Análise Estática Automática ao Digitar"
                  description="Atualiza erros léxicos, sintáticos, AST, CFG, Símbolos e Tokens automaticamente enquanto você digita."
                  checked={settings.autoAnalyze}
                  onChange={(val) => updateSettings({ autoAnalyze: val })}
                />

                {/* Debounce e Max Steps */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text-main)]">
                      Atraso da Análise (Debounce)
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {([250, 400, 800] as const).map((ms) => (
                        <button
                          key={ms}
                          type="button"
                          onClick={() => updateSettings({ analyzeDelay: ms })}
                          className={`py-1.5 px-2 rounded-[var(--ui-radius)] border font-mono text-[11px] transition ${
                            settings.analyzeDelay === ms
                              ? 'border-[var(--accent-primary)] bg-[var(--bg-surface)] text-[var(--accent-primary)] font-semibold'
                              : 'border-[var(--border-subtle)] bg-[var(--bg-surface-soft)] text-[var(--text-muted)]'
                          }`}
                        >
                          {ms} ms
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text-main)]">
                      Limite de Passos em Runtime
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(
                        [
                          [50000, '50 mil'],
                          [100000, '100 mil'],
                          [500000, '500 mil'],
                        ] as const
                      ).map(([steps, lbl]) => (
                        <button
                          key={steps}
                          type="button"
                          onClick={() => updateSettings({ maxSteps: steps })}
                          className={`py-1.5 px-2 rounded-[var(--ui-radius)] border font-mono text-[11px] transition ${
                            settings.maxSteps === steps
                              ? 'border-[var(--accent-primary)] bg-[var(--bg-surface)] text-[var(--accent-primary)] font-semibold'
                              : 'border-[var(--border-subtle)] bg-[var(--bg-surface-soft)] text-[var(--text-muted)]'
                          }`}
                        >
                          {lbl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. ATALHOS */}
            {activeSection === 'keymap' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-main)]">
                    Atalhos de Teclado
                  </h3>
                  <p className="text-[11.5px] text-[var(--text-muted)] mt-0.5">
                    Navegação rápida pelo editor, terminal, explorador e compilador MiniLang.
                  </p>
                </div>

                <div className="border border-[var(--border-subtle)] rounded-[var(--ui-radius)] overflow-hidden bg-[var(--bg-surface-soft)]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[var(--bg-surface)] text-[var(--text-muted)] uppercase tracking-wider font-mono text-[10px] border-b border-[var(--border-subtle)]">
                      <tr>
                        <th className="py-2.5 px-3.5 font-semibold">Ação</th>
                        <th className="py-2.5 px-3.5 font-semibold text-right">Atalho</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-faint)] text-[var(--text-main)]">
                      {[
                        ['Executar Programa', 'F9 / Ctrl+Enter'],
                        ['Paleta de Comandos', 'Ctrl+K / Ctrl+Shift+P'],
                        ['Formatar Código', 'Shift+Alt+F'],
                        ['Alternar Explorador', 'Alt+1'],
                        ['Alternar Terminal', 'Alt+4'],
                        ['Alternar Problemas', 'Alt+6'],
                        ['Limpar Terminal', 'Ctrl+L'],
                        ['Autocompletar no Terminal', 'Tab'],
                        ['Histórico no Terminal', '↑ / ↓'],
                        ['Abrir Configurações', 'Ctrl+,'],
                        ['Parar Execução / Fechar Modal', 'Esc'],
                      ].map(([label, keys]) => (
                        <tr key={label} className="hover:bg-[var(--bg-subtle-soft)]">
                          <td className="py-2 px-3.5">{label}</td>
                          <td className="py-2 px-3.5 text-right font-mono text-[var(--text-muted)]">
                            {keys}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rodapé */}
        <div className="h-12 px-5 bg-[var(--bg-surface)] border-t border-[var(--border-subtle)] flex items-center justify-between shrink-0">
          <span className="text-[11px] text-[var(--text-muted)]">
            Preferências salvas automaticamente no navegador
          </span>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-[var(--ui-radius)] bg-[var(--accent-primary)] hover:opacity-90 text-white transition font-medium text-xs shadow-sm"
          >
            Concluído
          </button>
        </div>
      </div>
    </div>
  );
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  optimize,
  onToggleOptimize,
}) => {
  if (!isOpen) return null;
  return (
    <SettingsDialogContent
      onClose={onClose}
      optimize={optimize}
      onToggleOptimize={onToggleOptimize}
    />
  );
};
