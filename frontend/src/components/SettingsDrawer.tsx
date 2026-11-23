import React, { useState, useEffect } from 'react';
import {
  X,
  Palette,
  Type,
  Keyboard,
  Check,
  Code2,
  Settings as SettingsIcon,
  Zap,
  Play,
  FolderTree,
  Terminal,
  Layers,
} from 'lucide-react';
import { useTheme, THEMES } from '../context/ThemeContext';
import type { ThemeId, EditorFontSize, EditorFontFamily } from '../types';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  optimize?: boolean;
  onToggleOptimize?: (enabled: boolean) => void;
}

type SettingsSection = 'appearance' | 'compiler' | 'font' | 'general' | 'keymap';

function getThemePreviewVars(themeId: ThemeId) {
  switch (themeId) {
    case 'jetbrains':
      return {
        bgApp: '#1e1f22',
        bgSurface: '#1e1f22',
        bgPanel: '#2b2d30',
        bgHeader: '#2b2d30',
        border: '#393b40',
        accentPrimary: '#3574f0',
        accentSecondary: '#59a869',
        textMain: '#dfe1e5',
        textMuted: '#868a91',
        keyword: '#cf8e6d',
        string: '#6aab73',
      };
    case 'arceus':
      return {
        bgApp: '#0c1017',
        bgSurface: '#121824',
        bgPanel: '#0a0d13',
        bgHeader: '#0f1520',
        border: '#243247',
        accentPrimary: '#f59e0b',
        accentSecondary: '#10b981',
        textMain: '#f8fafc',
        textMuted: '#94a3b8',
        keyword: '#f59e0b',
        string: '#10b981',
      };
    case 'arceus-light':
      return {
        bgApp: '#f1f5f9',
        bgSurface: '#ffffff',
        bgPanel: '#f8fafc',
        bgHeader: '#e2e8f0',
        border: '#cbd5e1',
        accentPrimary: '#d97706',
        accentSecondary: '#059669',
        textMain: '#0f172a',
        textMuted: '#64748b',
        keyword: '#b45309',
        string: '#059669',
      };
    case 'void':
      return {
        bgApp: '#0a0e14',
        bgSurface: '#0f141c',
        bgPanel: '#070a0e',
        bgHeader: '#0c1017',
        border: '#1e293b',
        accentPrimary: '#38bdf8',
        accentSecondary: '#6366f1',
        textMain: '#f1f5f9',
        textMuted: '#94a3b8',
        keyword: '#38bdf8',
        string: '#a78bfa',
      };
    case 'dialga':
      return {
        bgApp: '#060913',
        bgSurface: '#0b1222',
        bgPanel: '#04070e',
        bgHeader: '#080d1a',
        border: '#1a2c50',
        accentPrimary: '#06b6d4',
        accentSecondary: '#3b82f6',
        textMain: '#f0f9ff',
        textMuted: '#7dd3fc',
        keyword: '#06b6d4',
        string: '#60a5fa',
      };
    case 'giratina':
      return {
        bgApp: '#0d070a',
        bgSurface: '#140b0f',
        bgPanel: '#090406',
        bgHeader: '#100a0d',
        border: '#381a25',
        accentPrimary: '#f43f5e',
        accentSecondary: '#d97706',
        textMain: '#fff1f2',
        textMuted: '#fda4af',
        keyword: '#f43f5e',
        string: '#fbbf24',
      };
    case 'palkia':
      return {
        bgApp: '#0c0614',
        bgSurface: '#130920',
        bgPanel: '#08040d',
        bgHeader: '#10081c',
        border: '#331a54',
        accentPrimary: '#a855f7',
        accentSecondary: '#ec4899',
        textMain: '#faf5ff',
        textMuted: '#c084fc',
        keyword: '#c084fc',
        string: '#f472b6',
      };
    case 'rayquaza':
      return {
        bgApp: '#040d0a',
        bgSurface: '#091813',
        bgPanel: '#020806',
        bgHeader: '#071410',
        border: '#194435',
        accentPrimary: '#10b981',
        accentSecondary: '#fbbf24',
        textMain: '#ecfdf5',
        textMuted: '#6ee7b7',
        keyword: '#10b981',
        string: '#fcd34d',
      };
    case 'zekrom':
      return {
        bgApp: '#000000',
        bgSurface: '#0a0c10',
        bgPanel: '#000000',
        bgHeader: '#05070a',
        border: '#1f2937',
        accentPrimary: '#00e5ff',
        accentSecondary: '#38bdf8',
        textMain: '#f8fafc',
        textMuted: '#94a3b8',
        keyword: '#00e5ff',
        string: '#38bdf8',
      };
    case 'reshiram':
      return {
        bgApp: '#f5f5f4',
        bgSurface: '#ffffff',
        bgPanel: '#fafaf9',
        bgHeader: '#e7e5e4',
        border: '#d6d3d1',
        accentPrimary: '#ea580c',
        accentSecondary: '#f59e0b',
        textMain: '#1c1917',
        textMuted: '#78716c',
        keyword: '#ea580c',
        string: '#d97706',
      };
    default:
      return {
        bgApp: '#1e1f22',
        bgSurface: '#1e1f22',
        bgPanel: '#2b2d30',
        bgHeader: '#2b2d30',
        border: '#393b40',
        accentPrimary: '#3574f0',
        accentSecondary: '#59a869',
        textMain: '#dfe1e5',
        textMuted: '#868a91',
        keyword: '#cf8e6d',
        string: '#6aab73',
      };
  }
}

// Visualizador Interativo de Prévia da IDE
function IdeThemePreview({ themeId }: { themeId: ThemeId }) {
  const p = getThemePreviewVars(themeId);
  const currentTheme = THEMES.find((t) => t.id === themeId) || THEMES[0];

  return (
    <div
      className="rounded-lg border overflow-hidden shadow-lg transition-all duration-200 select-none"
      style={{
        backgroundColor: p.bgApp,
        borderColor: p.border,
      }}
    >
      {/* Topbar da Prévia */}
      <div
        className="h-7 px-2 flex items-center justify-between border-b text-[10px]"
        style={{
          backgroundColor: p.bgHeader,
          borderColor: p.border,
          color: p.textMuted,
        }}
      >
        <div className="flex items-center gap-1.5">
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500/80 inline-block" />
            <span className="w-2 h-2 rounded-full bg-yellow-500/80 inline-block" />
            <span className="w-2 h-2 rounded-full bg-green-500/80 inline-block" />
          </div>
          <span
            className="font-semibold text-[10.5px] ml-1"
            style={{ color: p.textMain }}
          >
            Arceus Web
          </span>
          <span className="opacity-40">•</span>
          <span className="text-[9.5px]">arceus-web</span>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9.5px] font-medium"
            style={{
              backgroundColor: `${p.accentSecondary}22`,
              color: p.accentSecondary,
            }}
          >
            <Play className="w-2.5 h-2.5 fill-current" />
            <span>Run</span>
          </div>
          <span
            className="text-[9px] px-1 py-0.2 rounded"
            style={{
              backgroundColor: `${p.accentPrimary}22`,
              color: p.accentPrimary,
            }}
          >
            Online
          </span>
        </div>
      </div>

      {/* Corpo da Prévia: ActivityBar + Sidebar + Editor & Terminal */}
      <div className="flex h-36">
        {/* ActivityBar */}
        <div
          className="w-7 border-r flex flex-col items-center py-1.5 gap-2 shrink-0"
          style={{
            backgroundColor: p.bgApp,
            borderColor: p.border,
            color: p.textMuted,
          }}
        >
          <FolderTree
            className="w-3 h-3"
            style={{ color: p.accentPrimary }}
          />
          <Terminal className="w-3 h-3 opacity-60" />
          <Layers className="w-3 h-3 opacity-60" />
        </div>

        {/* Mini Project Sidebar */}
        <div
          className="w-28 border-r p-1.5 text-[9.5px] flex flex-col gap-0.5 shrink-0"
          style={{
            backgroundColor: p.bgPanel,
            borderColor: p.border,
            color: p.textMuted,
          }}
        >
          <div className="font-semibold text-[9px] uppercase tracking-wider mb-0.5 opacity-60">
            Project
          </div>
          <div className="flex items-center gap-1 opacity-80">
            <span>▾</span>
            <span>src</span>
          </div>
          <div
            className="flex items-center gap-1 pl-2.5 py-0.5 rounded font-mono font-medium"
            style={{
              backgroundColor: `${p.accentPrimary}25`,
              color: p.textMain,
            }}
          >
            <span
              className="w-2 h-2 rounded-[1px] flex items-center justify-center text-[6px] font-bold"
              style={{
                backgroundColor: `${p.accentPrimary}33`,
                color: p.accentPrimary,
              }}
            >
              M
            </span>
            <span>main.ml</span>
          </div>
        </div>

        {/* Área Central: Tabs + Código + Mini Terminal */}
        <div
          className="flex-1 flex flex-col overflow-hidden"
          style={{ backgroundColor: p.bgSurface }}
        >
          {/* Tab Bar */}
          <div
            className="h-5 px-1.5 border-b flex items-center gap-1 text-[9.5px]"
            style={{
              backgroundColor: p.bgHeader,
              borderColor: p.border,
            }}
          >
            <div
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-t font-mono text-[9px]"
              style={{
                backgroundColor: p.bgSurface,
                color: p.textMain,
                borderBottom: `2px solid ${p.accentPrimary}`,
              }}
            >
              <span>main.ml</span>
            </div>
          </div>

          {/* Editor de Código */}
          <div
            className="flex-1 p-2 font-mono text-[9.5px] leading-relaxed overflow-hidden"
            style={{
              backgroundColor: p.bgSurface,
              color: p.textMain,
            }}
          >
            <div>
              <span className="opacity-40 select-none mr-2">1</span>
              <span style={{ color: p.keyword, fontWeight: 'bold' }}>programa</span>{' '}
              <span style={{ color: p.textMain }}>arceus_demo {'{'}</span>
            </div>
            <div>
              <span className="opacity-40 select-none mr-2">2</span>
              <span className="opacity-0">..</span>
              <span style={{ color: p.accentSecondary }}>limite</span> ={' '}
              <span style={{ color: p.accentPrimary }}>10</span>;
            </div>
            <div>
              <span className="opacity-40 select-none mr-2">3</span>
              <span className="opacity-0">..</span>
              <span style={{ color: p.keyword }}>imprima</span>(
              <span style={{ color: p.string }}>&quot;Resultado: &quot;</span>, limite);
            </div>
            <div>
              <span className="opacity-40 select-none mr-2">4</span>
              <span>{'}'}</span>
            </div>
          </div>

          {/* Mini Terminal */}
          <div
            className="h-10 border-t p-1.5 font-mono text-[8.5px] flex flex-col justify-center"
            style={{
              backgroundColor: p.bgPanel,
              borderColor: p.border,
              color: p.textMuted,
            }}
          >
            <div className="flex items-center gap-1">
              <span style={{ color: p.accentSecondary }}>&gt;</span>
              <span style={{ color: p.textMain }}>Resultado: 10</span>
            </div>
            <div className="text-[8px] opacity-60">
              Process finished with exit code 0
            </div>
          </div>
        </div>
      </div>

      {/* Mini StatusBar */}
      <div
        className="h-4 px-2 border-t flex items-center justify-between text-[8px]"
        style={{
          backgroundColor: p.bgHeader,
          borderColor: p.border,
          color: p.textMuted,
        }}
      >
        <div className="flex items-center gap-2">
          <span>MiniLang 0.1.0</span>
          <span>•</span>
          <span style={{ color: p.accentSecondary }}>No problems</span>
        </div>
        <div className="flex items-center gap-2 font-mono">
          <span>3:12</span>
          <span>UTF-8</span>
          <span style={{ color: p.accentPrimary }}>{currentTheme.name}</span>
        </div>
      </div>
    </div>
  );
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  optimize = false,
  onToggleOptimize,
}) => {
  const { theme, setTheme, settings, updateSettings } = useTheme();
  const [activeSection, setActiveSection] = useState<SettingsSection>('appearance');
  const [hoveredTheme, setHoveredTheme] = useState<ThemeId | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentPreviewTheme = hoveredTheme || theme;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none font-sans">
      {/* JetBrains Settings Dialog Window */}
      <div
        className="w-full max-w-3xl h-[650px] bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-[8px] shadow-2xl flex flex-col overflow-hidden text-xs text-[var(--text-main)] transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Header do Diálogo de Configurações */}
        <div className="h-10 px-4 bg-[var(--bg-header)] border-b border-[var(--border-color)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-4 h-4 text-[var(--accent-primary)]" />
            <span className="font-semibold text-sm text-[var(--text-main)]">Settings</span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-[4px] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] transition"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. Corpo com Split: Barra Lateral de Categorias à Esquerda + Conteúdo à Direita */}
        <div className="flex-1 flex overflow-hidden">
          {/* Navegação por Categorias à Esquerda estilo IntelliJ IDEA */}
          <div className="w-56 bg-[var(--bg-app)] border-r border-[var(--border-color)] p-2 flex flex-col gap-0.5 shrink-0 overflow-y-auto">
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              IDE Settings
            </div>

            <button
              onClick={() => setActiveSection('appearance')}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] text-xs transition text-left ${
                activeSection === 'appearance'
                  ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] font-semibold border-l-2 border-[var(--accent-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]'
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
              <span>Appearance & Themes</span>
            </button>

            <button
              onClick={() => setActiveSection('compiler')}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] text-xs transition text-left ${
                activeSection === 'compiler'
                  ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] font-semibold border-l-2 border-[var(--accent-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Compiler & Optimizer</span>
            </button>

            <button
              onClick={() => setActiveSection('font')}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] text-xs transition text-left ${
                activeSection === 'font'
                  ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] font-semibold border-l-2 border-[var(--accent-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]'
              }`}
            >
              <Type className="w-3.5 h-3.5 text-emerald-500" />
              <span>Editor &gt; Font</span>
            </button>

            <button
              onClick={() => setActiveSection('general')}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] text-xs transition text-left ${
                activeSection === 'general'
                  ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] font-semibold border-l-2 border-[var(--accent-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Editor &gt; General</span>
            </button>

            <button
              onClick={() => setActiveSection('keymap')}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] text-xs transition text-left ${
                activeSection === 'keymap'
                  ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] font-semibold border-l-2 border-[var(--accent-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5 text-purple-400" />
              <span>Keymap (Shortcuts)</span>
            </button>
          </div>

          {/* Painel de Conteúdo de Configuração à Direita */}
          <div className="flex-1 bg-[var(--bg-panel)] p-5 overflow-y-auto">
            {/* SEÇÃO 1: APARÊNCIA & TEMAS COM PRÉVIA VISUAL EM TEMPO REAL */}
            {activeSection === 'appearance' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-main)]">
                    Color Scheme & Appearance
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                    Selecione um tema de cor para estilizar dinamicamente toda a interface da IDE e o editor.
                  </p>
                </div>

                {/* PRÉVIA VISUAL DA IDE */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-[var(--text-main)]">
                      Prévia em Tempo Real da IDE
                    </span>
                    <span className="text-[var(--text-muted)] font-mono text-[10px]">
                      {hoveredTheme
                        ? `Passando o cursor: ${THEMES.find((t) => t.id === hoveredTheme)?.name}`
                        : `Ativo: ${THEMES.find((t) => t.id === theme)?.name}`}
                    </span>
                  </div>
                  <IdeThemePreview themeId={currentPreviewTheme} />
                </div>

                {/* Grid de Seleção de Temas */}
                <div className="pt-2">
                  <div className="text-[11px] font-semibold text-[var(--text-main)] mb-2">
                    Temas Disponíveis
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {THEMES.map((t) => {
                      const isSelected = theme === t.id;
                      const [cBg, cSurface, cPrimary, cAccent] = t.previewColors;

                      return (
                        <div
                          key={t.id}
                          onClick={() => setTheme(t.id as ThemeId)}
                          onMouseEnter={() => setHoveredTheme(t.id as ThemeId)}
                          onMouseLeave={() => setHoveredTheme(null)}
                          className={`p-3 rounded-[6px] border text-left cursor-pointer transition flex flex-col justify-between ${
                            isSelected
                              ? 'border-[var(--accent-primary)] bg-[var(--bg-surface)] shadow-sm'
                              : 'border-[var(--border-color)] bg-[var(--bg-app)]/50 hover:border-[var(--accent-primary)]/60 hover:bg-[var(--bg-app)]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-xs text-[var(--text-main)]">
                              {t.name}
                            </span>
                            {isSelected && (
                              <span className="w-4 h-4 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </span>
                            )}
                          </div>

                          <p className="text-[10.5px] text-[var(--text-muted)] line-clamp-1 mb-2">
                            {t.subtitle}
                          </p>

                          {/* Swatches de Cores */}
                          <div className="flex items-center gap-1.5">
                            <div
                              className="w-3.5 h-3.5 rounded-full border border-black/30 shadow-inner"
                              style={{ backgroundColor: cBg }}
                              title="Background"
                            />
                            <div
                              className="w-3.5 h-3.5 rounded-full border border-black/30 shadow-inner"
                              style={{ backgroundColor: cSurface }}
                              title="Surface"
                            />
                            <div
                              className="w-3.5 h-3.5 rounded-full border border-black/30 shadow-inner"
                              style={{ backgroundColor: cPrimary }}
                              title="Primary Accent"
                            />
                            <div
                              className="w-3.5 h-3.5 rounded-full border border-black/30 shadow-inner"
                              style={{ backgroundColor: cAccent }}
                              title="Secondary Accent"
                            />
                            <span className="text-[10px] ml-auto font-mono text-[var(--text-muted)]">
                              {t.isDark ? 'Dark' : 'Light'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* SEÇÃO 2: COMPILADOR & OTIMIZAÇÕES (CONSTANT FOLDING) */}
            {activeSection === 'compiler' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-main)]">
                    Compiler & Optimization Settings
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                    Configure os passos de otimização de código intermediário e opções do analisador Arceus.
                  </p>
                </div>

                {/* Opção Constant Folding */}
                <div className="p-3.5 rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-app)]/60 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span className="font-semibold text-xs text-[var(--text-main)]">
                        Constant Folding (--opt)
                      </span>
                      <span
                        className={`text-[9.5px] px-1.5 py-0.2 rounded font-mono font-bold ${
                          optimize
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-zinc-700/30 text-zinc-400 border border-zinc-700/50'
                        }`}
                      >
                        {optimize ? 'ATIVADO' : 'DESATIVADO'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                      Avalia e dobra expressões aritméticas constantes em tempo de compilação na AST (por exemplo,{' '}
                      <code className="text-amber-400 font-mono">10 + 20 * 2</code> é reduzido diretamente para{' '}
                      <code className="text-emerald-400 font-mono">50</code> antes de gerar as instruções).
                    </p>
                    <p className="text-[10.5px] text-[var(--text-muted)]/80">
                      Reduz o número de nós na árvore sintática, limpa o grafo de fluxo de controle (CFG) e acelera a execução no interpretador.
                    </p>
                  </div>

                  <div className="pt-0.5 shrink-0">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={optimize}
                        onChange={(e) => {
                          const val = e.target.checked;
                          updateSettings({ optimize: val });
                          onToggleOptimize?.(val);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-[var(--bg-subtle)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--accent-primary)]" />
                    </label>
                  </div>
                </div>

                {/* Informações adicionais do compilador */}
                <div className="p-3 rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-app)]/30 text-[11px] text-[var(--text-muted)] space-y-1">
                  <div className="font-semibold text-[var(--text-main)]">Pipelines Suportados:</div>
                  <ul className="list-disc list-inside space-y-0.5 text-[10.5px]">
                    <li>Análise Léxica & Tabela de Tokens</li>
                    <li>Parser Sintático & Geração da AST Hierárquica</li>
                    <li>Tabela de Símbolos com Resolução Estática de Escopos</li>
                    <li>CFG (Control Flow Graph) com blocos básicos</li>
                  </ul>
                </div>
              </div>
            )}

            {/* SEÇÃO 3: FONTE DO EDITOR */}
            {activeSection === 'font' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-main)]">Editor Font</h3>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                    Configure a tipografia principal para leitura e edição de código.
                  </p>
                </div>

                {/* Família */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-main)]">Font Family</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['JetBrains Mono', 'Fira Code'] as EditorFontFamily[]).map((font) => (
                      <button
                        key={font}
                        onClick={() => updateSettings({ fontFamily: font })}
                        className={`p-2.5 rounded-[4px] border text-left transition ${
                          settings.fontFamily === font
                            ? 'border-[var(--accent-primary)] bg-[var(--bg-surface)] text-[var(--text-main)] font-semibold'
                            : 'border-[var(--border-color)] bg-[var(--bg-app)]/60 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-app)]'
                        }`}
                      >
                        <div className="font-semibold text-xs">{font}</div>
                        <div className="text-[11px] mt-1 opacity-70" style={{ fontFamily: font }}>
                          func main() {'{'} a = 42; {'}'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tamanho da Fonte */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-semibold text-[var(--text-main)]">Font Size</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['12px', '14px', '16px', '18px'] as EditorFontSize[]).map((size) => (
                      <button
                        key={size}
                        onClick={() => updateSettings({ fontSize: size })}
                        className={`py-1.5 px-3 rounded-[4px] border font-mono text-center transition ${
                          settings.fontSize === size
                            ? 'border-[var(--accent-primary)] bg-[var(--bg-surface)] text-[var(--accent-primary)] font-bold'
                            : 'border-[var(--border-color)] bg-[var(--bg-app)]/60 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-app)]'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ligaduras */}
                <div className="flex items-center justify-between p-3 rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-app)]/60 mt-3">
                  <div>
                    <div className="font-semibold text-xs text-[var(--text-main)]">Enable Font Ligatures</div>
                    <div className="text-[11px] text-[var(--text-muted)]">Combina operadores gráficos como -&gt;, ==, !=</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enableLigatures}
                    onChange={(e) => updateSettings({ enableLigatures: e.target.checked })}
                    className="w-4 h-4 accent-[var(--accent-primary)] rounded cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* SEÇÃO 4: EDITOR GENERAL */}
            {activeSection === 'general' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-main)]">General Editor Settings</h3>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                    Configure quebra de linha, minimap e preferências visuais.
                  </p>
                </div>

                {/* Word Wrap */}
                <div className="flex items-center justify-between p-3 rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-app)]/60">
                  <div>
                    <div className="font-semibold text-xs text-[var(--text-main)]">Soft-Wrap (Line Wrapping)</div>
                    <div className="text-[11px] text-[var(--text-muted)]">Quebra linhas longas automaticamente sem rolagem horizontal</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.editorLineWrapping}
                    onChange={(e) => updateSettings({ editorLineWrapping: e.target.checked })}
                    className="w-4 h-4 accent-[var(--accent-primary)] rounded cursor-pointer"
                  />
                </div>

                {/* Minimap */}
                <div className="flex items-center justify-between p-3 rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-app)]/60">
                  <div>
                    <div className="font-semibold text-xs text-[var(--text-main)]">Show Code Minimap</div>
                    <div className="text-[11px] text-[var(--text-muted)]">Exibe miniatura com visão geral do código à direita do editor</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showMinimap}
                    onChange={(e) => updateSettings({ showMinimap: e.target.checked })}
                    className="w-4 h-4 accent-[var(--accent-primary)] rounded cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* SEÇÃO 5: KEYMAP */}
            {activeSection === 'keymap' && (
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-main)]">Keymap</h3>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                    Atalhos de teclado compatíveis com o ecossistema JetBrains New UI.
                  </p>
                </div>

                <div className="border border-[var(--border-color)] rounded-[4px] overflow-hidden bg-[var(--bg-app)]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[var(--bg-header)] text-[var(--text-muted)] uppercase tracking-wider font-mono text-[10px] border-b border-[var(--border-color)]">
                      <tr>
                        <th className="py-2 px-3 font-semibold">Action</th>
                        <th className="py-2 px-3 font-semibold text-right">Shortcut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]/50 text-[var(--text-main)]">
                      <tr className="hover:bg-[var(--bg-subtle)]/50">
                        <td className="py-2 px-3">Run Program</td>
                        <td className="py-2 px-3 text-right font-mono text-[var(--text-muted)]">F9 / Ctrl+Enter</td>
                      </tr>
                      <tr className="hover:bg-[var(--bg-subtle)]/50">
                        <td className="py-2 px-3">Reformat Code</td>
                        <td className="py-2 px-3 text-right font-mono text-[var(--text-muted)]">Shift+Alt+F / Ctrl+Alt+L</td>
                      </tr>
                      <tr className="hover:bg-[var(--bg-subtle)]/50">
                        <td className="py-2 px-3">Search Everywhere</td>
                        <td className="py-2 px-3 text-right font-mono text-[var(--text-muted)]">Double Shift / Ctrl+K</td>
                      </tr>
                      <tr className="hover:bg-[var(--bg-subtle)]/50">
                        <td className="py-2 px-3">Toggle Project Window</td>
                        <td className="py-2 px-3 text-right font-mono text-[var(--text-muted)]">Alt+1</td>
                      </tr>
                      <tr className="hover:bg-[var(--bg-subtle)]/50">
                        <td className="py-2 px-3">Toggle Run / Terminal</td>
                        <td className="py-2 px-3 text-right font-mono text-[var(--text-muted)]">Alt+4</td>
                      </tr>
                      <tr className="hover:bg-[var(--bg-subtle)]/50">
                        <td className="py-2 px-3">Toggle Problems</td>
                        <td className="py-2 px-3 text-right font-mono text-[var(--text-muted)]">Alt+6</td>
                      </tr>
                      <tr className="hover:bg-[var(--bg-subtle)]/50">
                        <td className="py-2 px-3">Clear Console</td>
                        <td className="py-2 px-3 text-right font-mono text-[var(--text-muted)]">Ctrl+L</td>
                      </tr>
                      <tr className="hover:bg-[var(--bg-subtle)]/50">
                        <td className="py-2 px-3">Open Settings</td>
                        <td className="py-2 px-3 text-right font-mono text-[var(--text-muted)]">Ctrl+,</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. Rodapé Estilo JetBrains: Botões OK / Cancel / Apply */}
        <div className="h-11 px-4 bg-[var(--bg-header)] border-t border-[var(--border-color)] flex items-center justify-between shrink-0">
          <span className="text-[11px] text-[var(--text-muted)]">
            Arceus Web IDE • JetBrains Edition
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1 rounded-[4px] bg-[var(--bg-subtle)] hover:opacity-90 text-[var(--text-main)] transition font-medium text-xs"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1 rounded-[4px] bg-[var(--accent-primary)] hover:opacity-90 text-white transition font-medium text-xs shadow-sm"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
