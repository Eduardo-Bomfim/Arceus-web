import { useState, useRef, useEffect } from 'react';
import {
  Play,
  Square,
  SearchCode,
  Sparkles,
  Download,
  FolderOpen,
  ChevronDown,
  Activity,
  Sliders,
  Share2,
  Command,
} from 'lucide-react';
import type { HealthStatus, RunnerStatus } from '../types';
import { EXAMPLES } from '../examples';
import { useTheme } from '../context/ThemeContext';

interface TopbarProps {
  status: RunnerStatus;
  optimize: boolean;
  onToggleOptimize: (enabled: boolean) => void;
  onRun: () => void;
  onAbort: () => void;
  onAnalyze: () => void;
  onSelectExample: (code: string) => void;
  onOpenFile: () => void;
  onDownloadFile: () => void;
  onShare?: () => void;
  onOpenCommandPalette?: () => void;
  health: HealthStatus;
  isAnalyzing: boolean;
}

// Ícone SVG personalizado do Anel Sagrado da Criação de Arceus
function ArceusRingIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Círculo da Roda */}
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="4 2"
      />
      {/* Arco de ouro interior */}
      <circle
        cx="12"
        cy="12"
        r="6.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* 4 Pontas da Cruz da Criação */}
      <line x1="12" y1="2" x2="12" y2="7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="12" y1="17" x2="12" y2="22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="2" y1="12" x2="7" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="17" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* Gemas Esmeralda nas junções */}
      <circle cx="12" cy="7" r="1.5" fill="#10b981" />
      <circle cx="12" cy="17" r="1.5" fill="#10b981" />
      <circle cx="7" cy="12" r="1.5" fill="#10b981" />
      <circle cx="17" cy="12" r="1.5" fill="#10b981" />
      {/* Núcleo de Criação */}
      <circle cx="12" cy="12" r="2" fill="#f59e0b" />
    </svg>
  );
}

export function Topbar({
  status,
  optimize,
  onToggleOptimize,
  onRun,
  onAbort,
  onAnalyze,
  onSelectExample,
  onOpenFile,
  onDownloadFile,
  onShare,
  onOpenCommandPalette,
  health,
  isAnalyzing,
}: TopbarProps) {
  const [examplesOpen, setExamplesOpen] = useState(false);
  const examplesRef = useRef<HTMLDivElement>(null);

  const { themeConfig, setIsSettingsOpen } = useTheme();

  const isRunning = status === 'RUNNING' || status === 'WAITING_INPUT' || status === 'CONNECTING';

  // Fecha dropdowns ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (examplesRef.current && !examplesRef.current.contains(event.target as Node)) {
        setExamplesOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex flex-wrap items-center justify-between px-3.5 py-2 bg-[var(--bg-header)] border-b border-[var(--border-color)] select-none gap-2 z-20 transition-colors">
      {/* Lado Esquerdo: Brand + Controles Primários */}
      <div className="flex items-center gap-3">
        {/* Brand / Logo com o Anel de Arceus */}
        <div className="flex items-center gap-2 mr-1 group cursor-default">
          <div
            className="p-1.5 rounded-lg text-amber-300 shadow-md transition-all duration-300 group-hover:scale-105"
            style={{
              backgroundColor: themeConfig.accentBg,
              border: `1px solid ${themeConfig.primaryColor}55`,
              boxShadow: `0 0 14px ${themeConfig.primaryColor}33`,
            }}
          >
            <ArceusRingIcon className="w-5 h-5 animate-[spin_20s_linear_infinite]" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-[var(--text-main)] flex items-center gap-1.5">
              <span>Arceus</span>
              <span
                className="text-[10px] font-semibold px-1.5 py-0.2 rounded border"
                style={{
                  backgroundColor: themeConfig.accentBg,
                  color: themeConfig.primaryColor,
                  borderColor: `${themeConfig.primaryColor}44`,
                }}
              >
                MiniLang IDE
              </span>
            </h1>
          </div>
        </div>

        {/* Botão Executar / Interromper */}
        {!isRunning ? (
          <button
            onClick={onRun}
            title="Executar Programa (F9 ou Ctrl+Enter)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold text-xs transition shadow-sm active:scale-95 text-white"
            style={{
              backgroundColor: themeConfig.primaryColor,
              boxShadow: `0 0 12px ${themeConfig.primaryColor}44`,
            }}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Executar</span>
            <kbd className="hidden sm:inline-block ml-1 px-1 rounded bg-black/25 text-[10px] text-white/90">
              F9
            </kbd>
          </button>
        ) : (
          <button
            onClick={onAbort}
            title="Interromper Execução (Esc)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition shadow-sm shadow-rose-950 active:scale-95 animate-pulse"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Parar</span>
          </button>
        )}

        {/* Botão Analisar */}
        <button
          onClick={onAnalyze}
          disabled={isRunning || isAnalyzing}
          title="Executa apenas a validação estática de tipos, AST e tabela de símbolos"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-[var(--text-main)] text-xs transition border border-[var(--border-color)] disabled:opacity-50"
        >
          <SearchCode className="w-3.5 h-3.5" style={{ color: themeConfig.primaryColor }} />
          <span className="hidden sm:inline">Analisar</span>
        </button>

        {/* Switch de Constant Folding (--opt) */}
        <label className="flex items-center gap-2 cursor-pointer text-xs text-[var(--text-main)] transition px-2 py-1 rounded bg-[var(--bg-surface)] border border-[var(--border-color)]">
          <input
            type="checkbox"
            checked={optimize}
            onChange={(e) => onToggleOptimize(e.target.checked)}
            className="sr-only peer"
          />
          <div
            className="w-7 h-4 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all relative"
            style={
              optimize
                ? { backgroundColor: themeConfig.primaryColor }
                : undefined
            }
          />
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--text-main)]">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span className="hidden md:inline">Constant Folding</span> (--opt)
            {optimize && (
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                ATIVO
              </span>
            )}
          </span>
        </label>
      </div>

      {/* Lado Direito: Seletor de Temas, Exemplos, Arquivos e Status da API */}
      <div className="flex items-center gap-2">
        {/* Botão Configurações & Galeria de Temas */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          title={`Configurações & Temas (Ctrl+,) — Atual: ${themeConfig.name}`}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-[var(--text-main)] text-xs transition border border-[var(--border-color)] group"
        >
          <div
            className="w-2.5 h-2.5 rounded-full shadow-sm ring-1 ring-white/20 transition-transform group-hover:scale-110"
            style={{ backgroundColor: themeConfig.primaryColor }}
          />
          <span className="hidden sm:inline font-medium">{themeConfig.name}</span>
          <Sliders className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors ml-0.5" />
        </button>

        {/* Dropdown de Exemplos */}
        <div className="relative" ref={examplesRef}>
          <button
            onClick={() => setExamplesOpen(!examplesOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-[var(--text-main)] text-xs transition border border-[var(--border-color)]"
          >
            <span>Exemplos</span>
            <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />
          </button>

          {examplesOpen && (
            <div className="absolute right-0 mt-1.5 w-72 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-2xl shadow-black/80 py-1.5 z-50 divide-y divide-[var(--border-color)]">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Templates da MiniLang
              </div>
              <div className="py-1 max-h-80 overflow-y-auto">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => {
                      onSelectExample(ex.code);
                      setExamplesOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-[var(--bg-subtle)] transition flex flex-col group"
                  >
                    <span className="text-xs font-semibold text-[var(--text-main)] group-hover:text-amber-400 transition flex items-center justify-between">
                      {ex.title}
                      <span className="text-[10px] font-normal text-[var(--text-muted)] bg-[var(--bg-panel)] px-1.5 rounded">
                        {ex.category}
                      </span>
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
                      {ex.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Botão Paleta de Comandos */}
        {onOpenCommandPalette && (
          <button
            onClick={onOpenCommandPalette}
            title="Paleta de Comandos (Ctrl+Shift+P ou Ctrl+K)"
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-white transition border border-[var(--border-color)] text-xs"
          >
            <Command className="w-3.5 h-3.5" />
            <kbd className="hidden lg:inline text-[10px] bg-black/30 px-1 py-0.5 rounded text-[var(--text-muted)]">
              ⌘K
            </kbd>
          </button>
        )}

        {/* Botão Compartilhar */}
        {onShare && (
          <button
            onClick={onShare}
            title="Compartilhar código via link URL codificado"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-[var(--text-main)] hover:text-white transition border border-[var(--border-color)] text-xs"
          >
            <Share2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Compartilhar</span>
          </button>
        )}

        {/* Botão Abrir arquivo */}
        <button
          onClick={onOpenFile}
          title="Abrir arquivo MiniLang (.ml) do seu computador"
          className="p-1.5 rounded-md bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-white transition border border-[var(--border-color)]"
        >
          <FolderOpen className="w-3.5 h-3.5" />
        </button>

        {/* Botão Baixar arquivo */}
        <button
          onClick={onDownloadFile}
          title="Baixar código fonte (.ml)"
          className="p-1.5 rounded-md bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-white transition border border-[var(--border-color)]"
        >
          <Download className="w-3.5 h-3.5" />
        </button>

        {/* Badge de Status da API */}
        <div className="pl-2 border-l border-[var(--border-color)]">
          {health.state === 'online' && (
            <div
              className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 text-[11px]"
              title={`API Online: Python ${health.python ?? '3.13'} (${health.compiler})`}
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">Online</span>
            </div>
          )}

          {health.state === 'sleeping' && (
            <div
              className="flex items-center gap-1.5 px-2 py-1 rounded bg-amber-950/40 text-amber-300 border border-amber-800/40 text-[11px]"
              title="O servidor no Render está acordando do modo de hibernação gratuita..."
            >
              <Activity className="w-3 h-3 text-amber-400 animate-spin" />
              <span className="hidden sm:inline">Acordando ({health.progress}%)</span>
            </div>
          )}

          {health.state === 'checking' && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 text-slate-400 text-[11px]">
              <div className="w-2 h-2 rounded-full bg-slate-500 animate-ping" />
              <span className="hidden sm:inline">Conectando...</span>
            </div>
          )}

          {health.state === 'offline' && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-rose-950/40 text-rose-400 border border-rose-800/40 text-[11px]">
              <div className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="hidden sm:inline">Offline</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
