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
  Share2,
  Search,
  Settings,
  GitBranch,
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
  optimize: boolean;
  onToggleOptimize: (enabled: boolean) => void;
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
      <span className="font-semibold text-xs tracking-tight text-[#dfe1e5] hidden sm:inline">
        Arceus
      </span>
    </div>
  );
}

export function Topbar({
  activeFileName = 'main.ml',
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
    <header className="h-10 px-2.5 bg-[#2b2d30] border-b border-[#1e1f22] flex items-center justify-between select-none text-xs text-[#dfe1e5] z-30 shrink-0 font-sans">
      {/* 1. Lado Esquerdo: Main Menu + Projeto + VCS Branch */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* JetBrains Hamburger Main Menu */}
        <button
          onClick={onOpenCommandPalette}
          title="Menu Principal (Ctrl+Shift+P ou Double Shift)"
          className="p-1.5 rounded-[4px] hover:bg-[#35373c] text-[#868a91] hover:text-[#dfe1e5] transition flex items-center justify-center"
        >
          <JetBrainsMenuIcon className="w-3.5 h-3.5" />
        </button>

        {/* Logo / Badge da IDE */}
        <div className="flex items-center mr-1">
          <JetBrainsAppLogo />
        </div>

        <div className="w-[1px] h-3.5 bg-[#393b40] mx-0.5" />

        {/* Project Widget Dropdown */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-[4px] hover:bg-[#35373c] cursor-pointer transition text-[#dfe1e5]">
          <Folder className="w-3.5 h-3.5 text-[#3574f0]" />
          <span className="font-medium text-xs">arceus-web</span>
          <ChevronDown className="w-3 h-3 text-[#868a91]" />
        </div>

        {/* VCS Branch Widget */}
        <div
          title="Git Branch: main"
          className="hidden md:flex items-center gap-1 px-2 py-1 rounded-[4px] hover:bg-[#35373c] cursor-pointer transition text-[#868a91] hover:text-[#dfe1e5]"
        >
          <GitBranch className="w-3 h-3" />
          <span className="text-[11px] font-mono">main</span>
        </div>
      </div>

      {/* 2. Centro: The Iconic JetBrains Run / Debug Widget */}
      <div className="flex items-center gap-1.5">
        <div className="flex items-center bg-[#1e1f22] border border-[#393b40] rounded-[6px] h-7 px-1 shadow-inner gap-0.5">
          {/* Seletor de Arquivo / Run Configuration */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] hover:bg-[#2b2d30] text-[#dfe1e5] cursor-pointer text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-[#3574f0]" />
            <span className="max-w-[180px] truncate">{activeFileName}</span>
          </div>

          <div className="w-[1px] h-3.5 bg-[#393b40] mx-0.5" />

          {/* Botão Executar (Ícone Play Verde JetBrains #59a869 / #388e3c) */}
          {!isRunning ? (
            <button
              onClick={onRun}
              title="Executar 'main.ml' (F9 ou Ctrl+Enter)"
              className="flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#388e3c]/20 hover:bg-[#388e3c]/35 text-[#59a869] hover:text-[#70b77e] transition font-semibold text-xs active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline text-[11px]">Run</span>
            </button>
          ) : (
            <button
              onClick={onAbort}
              title="Interromper Execução (Escape)"
              className="flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#f75464]/20 hover:bg-[#f75464]/35 text-[#f75464] transition font-semibold text-xs active:scale-95 animate-pulse"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline text-[11px]">Stop</span>
            </button>
          )}

          {/* Botão Analisar / Inspecionar (Ícone de Diagnóstico Estático) */}
          <button
            onClick={onAnalyze}
            disabled={isRunning || isAnalyzing}
            title="Inspecionar Código (Análise Estática de Tipos & AST)"
            className="p-1 rounded-[4px] text-[#868a91] hover:text-[#dfe1e5] hover:bg-[#2b2d30] transition disabled:opacity-40"
          >
            <SearchCode className="w-3.5 h-3.5 text-[#3574f0]" />
          </button>

          {/* Botão Parar / Stop Dedicado */}
          <button
            onClick={onAbort}
            disabled={!isRunning}
            title="Interromper Processo (Escape)"
            className={`p-1 rounded-[4px] transition ${
              isRunning
                ? 'text-[#f75464] hover:bg-[#f75464]/20'
                : 'text-[#4b5059] cursor-not-allowed'
            }`}
          >
            <Square className="w-3.5 h-3.5 fill-current" />
          </button>

          <div className="w-[1px] h-3.5 bg-[#393b40] mx-0.5" />

          {/* Toggle de Constant Folding (--opt) no estilo JetBrains Run Option */}
          <button
            onClick={() => onToggleOptimize(!optimize)}
            title="Ativar/Desativar Constant Folding (--opt)"
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] text-[11px] font-mono transition ${
              optimize
                ? 'bg-[#3574f0]/20 text-[#3574f0] font-semibold border border-[#3574f0]/40'
                : 'text-[#868a91] hover:text-[#dfe1e5] hover:bg-[#2b2d30]'
            }`}
          >
            <Sparkles className="w-3 h-3 text-[#f5a623]" />
            <span className="text-[10px]">--opt</span>
          </button>
        </div>
      </div>

      {/* 3. Lado Direito: Search Everywhere + Arquivos + Exemplos + Settings + API Health */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {/* JetBrains Search Everywhere Button (Double Shift) */}
        {onOpenCommandPalette && (
          <button
            onClick={onOpenCommandPalette}
            title="Search Everywhere (Double Shift ou Ctrl+K)"
            className="flex items-center gap-2 px-2.5 py-1 rounded-[6px] bg-[#1e1f22] border border-[#393b40] hover:border-[#4e88ef] text-[#868a91] hover:text-[#dfe1e5] transition text-xs"
          >
            <Search className="w-3 h-3 text-[#868a91]" />
            <span className="hidden md:inline text-[11px]">Search Everywhere</span>
            <kbd className="hidden lg:inline text-[10px] px-1 py-0.2 rounded bg-[#2b2d30] text-[#868a91] border border-[#393b40] font-mono">
              ⇧ ⇧
            </kbd>
          </button>
        )}

        {/* Dropdown de Exemplos */}
        <div className="relative" ref={examplesRef}>
          <button
            onClick={() => setExamplesOpen(!examplesOpen)}
            title="Templates e Exemplos de Código"
            className="flex items-center gap-1 px-2 py-1 rounded-[4px] hover:bg-[#35373c] text-[#dfe1e5] transition border border-transparent hover:border-[#393b40] text-xs"
          >
            <Layers className="w-3.5 h-3.5 text-[#3574f0]" />
            <span className="hidden md:inline">Exemplos</span>
            <ChevronDown className="w-3 h-3 text-[#868a91]" />
          </button>

          {examplesOpen && (
            <div className="absolute right-0 mt-1 w-72 rounded-[6px] bg-[#2b2d30] border border-[#393b40] shadow-2xl py-1 z-50 divide-y divide-[#393b40]">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#868a91]">
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
                    className="w-full text-left px-3 py-1.5 hover:bg-[#35373c] transition flex flex-col group"
                  >
                    <span className="text-xs font-semibold text-[#dfe1e5] group-hover:text-[#3574f0] transition flex items-center justify-between">
                      {ex.title}
                      <span className="text-[10px] font-normal text-[#868a91] bg-[#1e1f22] px-1.5 py-0.2 rounded">
                        {ex.category}
                      </span>
                    </span>
                    <span className="text-[11px] text-[#868a91] truncate mt-0.5">
                      {ex.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Botão Compartilhar */}
        {onShare && (
          <button
            onClick={handleShareClick}
            title="Compartilhar código via link"
            className="p-1.5 rounded-[4px] hover:bg-[#35373c] text-[#868a91] hover:text-[#dfe1e5] transition"
          >
            {copiedShare ? (
              <Check className="w-3.5 h-3.5 text-[#59a869]" />
            ) : (
              <Share2 className="w-3.5 h-3.5" />
            )}
          </button>
        )}

        {/* Abrir Arquivo Local */}
        <button
          onClick={onOpenFile}
          title="Abrir arquivo do computador (Ctrl+O)"
          className="p-1.5 rounded-[4px] hover:bg-[#35373c] text-[#868a91] hover:text-[#dfe1e5] transition"
        >
          <FolderOpen className="w-3.5 h-3.5" />
        </button>

        {/* Baixar Arquivo */}
        <button
          onClick={onDownloadFile}
          title="Baixar código fonte (.ml)"
          className="p-1.5 rounded-[4px] hover:bg-[#35373c] text-[#868a91] hover:text-[#dfe1e5] transition"
        >
          <Download className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-3.5 bg-[#393b40] mx-0.5" />

        {/* Settings Dialog Gear Icon */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          title={`Configurações & Temas (Ctrl+,) — ${themeConfig.name}`}
          className="p-1.5 rounded-[4px] hover:bg-[#35373c] text-[#868a91] hover:text-[#dfe1e5] transition"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>

        {/* JetBrains API Status Badge */}
        <div className="pl-1">
          {health.state === 'online' && (
            <div
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-[#388e3c]/15 text-[#59a869] border border-[#388e3c]/30 text-[11px]"
              title={`Compilador Online: Python ${health.python ?? '3.13'} (${health.compiler})`}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#59a869]" />
              <span className="hidden lg:inline text-[10px] font-medium">Online</span>
            </div>
          )}

          {health.state === 'sleeping' && (
            <div
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-[#f5a623]/15 text-[#f5a623] border border-[#f5a623]/30 text-[11px]"
              title="Acordando servidor no Render..."
            >
              <Activity className="w-3 h-3 text-[#f5a623] animate-spin" />
              <span className="hidden lg:inline text-[10px] font-medium">Acordando ({health.progress}%)</span>
            </div>
          )}

          {health.state === 'checking' && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-[#1e1f22] text-[#868a91] text-[11px] border border-[#393b40]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#868a91] animate-ping" />
              <span className="hidden lg:inline text-[10px]">Conectando</span>
            </div>
          )}

          {health.state === 'offline' && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-[#f75464]/15 text-[#f75464] border border-[#f75464]/30 text-[11px]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#f75464]" />
              <span className="hidden lg:inline text-[10px] font-medium">Offline</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
