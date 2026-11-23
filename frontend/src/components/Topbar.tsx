import { useState, useRef, useEffect } from 'react';
import {
  Play,
  Square,
  SearchCode,
  Download,
  FolderOpen,
  ChevronDown,
  Activity,
  Share2,
  Search,
  Settings,
  Folder,
  Layers,
  Check,
} from 'lucide-react';
import type { HealthStatus, RunnerStatus } from '../types';
import { EXAMPLES } from '../examples';
import { useTheme } from '../context/ThemeContext';

interface TopbarProps {
  activeFileName?: string;
  status: RunnerStatus;
  onRun: () => void;
  onAbort: () => void;
  onAnalyze: () => void;
  onSelectExample: (code: string, title?: string) => void;
  onOpenFile: () => void;
  onDownloadFile: () => void;
  onShare?: () => void;
  onOpenCommandPalette?: () => void;
  health: HealthStatus;
  isAnalyzing: boolean;
}

// Ícone do JetBrains Main Menu (4 barras horizontais minimalistas)
function JetBrainsMenuIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className}>
      <rect x="2" y="3" width="12" height="1.5" rx="0.75" />
      <rect x="2" y="6.5" width="12" height="1.5" rx="0.75" />
      <rect x="2" y="10" width="12" height="1.5" rx="0.75" />
      <rect x="2" y="13.5" width="12" height="1.5" rx="0.75" />
    </svg>
  );
}

// Logo oficial estilo JetBrains IDE
function JetBrainsAppLogo() {
  return (
    <div className="flex items-center gap-1.5 select-none">
      <div className="w-5 h-5 rounded-[4px] bg-gradient-to-br from-[#087cfa] via-[#ff318c] to-[#fe2857] flex items-center justify-center shadow-sm">
        <span className="text-[10px] font-black text-white tracking-tighter font-mono">AR</span>
      </div>
      <span className="font-semibold text-xs tracking-tight text-[var(--text-main)] hidden sm:inline">
        Arceus
      </span>
    </div>
  );
}

export function Topbar({
  activeFileName = 'main.ml',
  status,
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
  const [copiedShare, setCopiedShare] = useState(false);
  const examplesRef = useRef<HTMLDivElement>(null);

  const { themeConfig, setIsSettingsOpen } = useTheme();

  const isRunning = status === 'RUNNING' || status === 'WAITING_INPUT' || status === 'CONNECTING';

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (examplesRef.current && !examplesRef.current.contains(event.target as Node)) {
        setExamplesOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleShareClick = () => {
    if (onShare) {
      onShare();
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  return (
    <header className="h-9 px-2.5 bg-[var(--bg-header)] border-b border-[var(--border-color)] flex items-center justify-between select-none text-xs text-[var(--text-main)] z-30 shrink-0 font-sans transition-colors duration-200">
      {/* 1. Lado Esquerdo: Main Menu + Logo + Nome do Projeto */}
      <div className="flex items-center gap-2">
        {/* JetBrains Hamburger Main Menu */}
        <button
          onClick={onOpenCommandPalette}
          title="Menu Principal (Ctrl+Shift+P ou Double Shift)"
          className="p-1.5 rounded-[4px] hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition flex items-center justify-center"
        >
          <JetBrainsMenuIcon className="w-3.5 h-3.5" />
        </button>

        {/* Logo / Badge da IDE */}
        <div className="flex items-center">
          <JetBrainsAppLogo />
        </div>

        {/* Project Widget Dropdown */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-[4px] hover:bg-[var(--bg-subtle)] cursor-pointer transition text-[var(--text-main)]">
          <Folder className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
          <span className="font-medium text-xs">arceus-web</span>
          <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />
        </div>
      </div>

      {/* 2. Centro: The Iconic JetBrains Run / Debug Widget (Minimalista & Clean) */}
      <div className="flex items-center">
        <div className="flex items-center bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[6px] h-7 px-1 shadow-sm gap-0.5">
          {/* Seletor de Arquivo Ativo */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-[var(--text-main)] text-xs font-mono">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: themeConfig.primaryColor }}
            />
            <span className="max-w-[160px] truncate">{activeFileName}</span>
          </div>

          <div className="w-[1px] h-3.5 bg-[var(--border-color)] mx-0.5" />

          {/* Botão Executar (Run F9) */}
          {!isRunning ? (
            <button
              onClick={onRun}
              title="Executar 'main.ml' (F9 ou Ctrl+Enter)"
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-[4px] text-[var(--accent-secondary)] hover:bg-[var(--bg-subtle)] transition font-semibold text-xs active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline text-[11px]">Run</span>
            </button>
          ) : (
            <button
              onClick={onAbort}
              title="Interromper Execução (Escape)"
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-[4px] text-rose-400 bg-rose-500/15 hover:bg-rose-500/25 transition font-semibold text-xs active:scale-95 animate-pulse"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline text-[11px]">Stop</span>
            </button>
          )}

          {/* Botão Analisar / Inspecionar */}
          <button
            onClick={onAnalyze}
            disabled={isRunning || isAnalyzing}
            title="Inspecionar Código (Análise Estática de Tipos & AST)"
            className="p-1 rounded-[4px] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] transition disabled:opacity-40"
          >
            <SearchCode className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
          </button>

          {/* Botão Parar Dedicado */}
          <button
            onClick={onAbort}
            disabled={!isRunning}
            title="Interromper Processo (Escape)"
            className={`p-1 rounded-[4px] transition ${
              isRunning
                ? 'text-rose-400 hover:bg-rose-500/20'
                : 'text-[var(--text-muted)] opacity-40 cursor-not-allowed'
            }`}
          >
            <Square className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>
      </div>

      {/* 3. Lado Direito: Search Everywhere + Exemplos + Arquivos + Settings + API Health */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {/* JetBrains Search Everywhere Button (Double Shift) */}
        {onOpenCommandPalette && (
          <button
            onClick={onOpenCommandPalette}
            title="Search Everywhere (Double Shift ou Ctrl+K)"
            className="flex items-center gap-2 px-2.5 py-1 rounded-[6px] bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-[var(--accent-primary)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition text-xs"
          >
            <Search className="w-3 h-3 text-[var(--text-muted)]" />
            <span className="hidden md:inline text-[11px]">Search Everywhere</span>
            <kbd className="hidden lg:inline text-[10px] px-1 py-0.2 rounded bg-[var(--bg-header)] text-[var(--text-muted)] border border-[var(--border-color)] font-mono">
              ⇧ ⇧
            </kbd>
          </button>
        )}

        {/* Dropdown de Exemplos */}
        <div className="relative" ref={examplesRef}>
          <button
            onClick={() => setExamplesOpen(!examplesOpen)}
            title="Templates e Exemplos de Código"
            className="flex items-center gap-1 px-2 py-1 rounded-[4px] hover:bg-[var(--bg-subtle)] text-[var(--text-main)] transition text-xs"
          >
            <Layers className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            <span className="hidden md:inline">Exemplos</span>
            <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />
          </button>

          {examplesOpen && (
            <div className="absolute right-0 mt-1 w-72 rounded-[6px] bg-[var(--bg-panel)] border border-[var(--border-color)] shadow-2xl py-1 z-50 divide-y divide-[var(--border-color)]">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Exemplos da MiniLang
              </div>
              <div className="py-1 max-h-80 overflow-y-auto">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => {
                      onSelectExample(ex.code, ex.title);
                      setExamplesOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[var(--bg-subtle)] transition flex flex-col group"
                  >
                    <span className="text-xs font-semibold text-[var(--text-main)] group-hover:text-[var(--accent-primary)] transition flex items-center justify-between">
                      {ex.title}
                      <span className="text-[10px] font-normal text-[var(--text-muted)] bg-[var(--bg-header)] px-1.5 py-0.2 rounded">
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

        {/* Compartilhar */}
        {onShare && (
          <button
            onClick={handleShareClick}
            title="Compartilhar código via link"
            className="p-1.5 rounded-[4px] hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition"
          >
            {copiedShare ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Share2 className="w-3.5 h-3.5" />
            )}
          </button>
        )}

        {/* Abrir Arquivo Local */}
        <button
          onClick={onOpenFile}
          title="Abrir arquivo do computador (Ctrl+O)"
          className="p-1.5 rounded-[4px] hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition"
        >
          <FolderOpen className="w-3.5 h-3.5" />
        </button>

        {/* Baixar Arquivo */}
        <button
          onClick={onDownloadFile}
          title="Baixar código fonte (.ml)"
          className="p-1.5 rounded-[4px] hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition"
        >
          <Download className="w-3.5 h-3.5" />
        </button>

        {/* Settings Dialog Gear Icon */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          title={`Configurações & Temas (Ctrl+,) — ${themeConfig.name}`}
          className="p-1.5 rounded-[4px] hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>

        {/* Status da API Backend */}
        <div className="pl-1">
          {health.state === 'online' && (
            <div
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px]"
              title={`Compilador Online: Python ${health.python ?? '3.13'} (${health.compiler})`}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="hidden lg:inline text-[10px] font-medium">Online</span>
            </div>
          )}

          {health.state === 'sleeping' && (
            <div
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px]"
              title="Acordando servidor no Render..."
            >
              <Activity className="w-3 h-3 text-amber-400 animate-spin" />
              <span className="hidden lg:inline text-[10px] font-medium">Acordando ({health.progress}%)</span>
            </div>
          )}

          {health.state === 'checking' && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-[var(--bg-surface)] text-[var(--text-muted)] text-[11px] border border-[var(--border-color)]">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] animate-ping" />
              <span className="hidden lg:inline text-[10px]">Conectando</span>
            </div>
          )}

          {health.state === 'offline' && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[11px]">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              <span className="hidden lg:inline text-[10px] font-medium">Offline</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
