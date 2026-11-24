import { useState, useRef, useEffect } from 'react';
import {
  Play,
  Square,
  SearchCode,
  ChevronDown,
  Activity,
  Share2,
  Search,
  Settings,
  BookOpen,
  Check,
  PanelLeft,
  PanelRight,
} from 'lucide-react';
import type { HealthStatus, RunnerStatus } from '../types';
import { EXAMPLES } from '../examples';
import { useTheme } from '../context/ThemeContext';

interface TopbarProps {
  status: RunnerStatus;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onRun: () => void;
  onAbort: () => void;
  onAnalyze: () => void;
  onSelectExample: (code: string, title?: string) => void;
  onShare?: () => void;
  onOpenCommandPalette?: () => void;
  health: HealthStatus;
  isAnalyzing: boolean;
}

// Emblema geométrico minimalista Arceus que respeita a cor de destaque do tema ativo
function ArceusEmblem() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="w-5 h-5 shrink-0 text-[var(--accent-primary)]"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="8.5"
        stroke="currentColor"
        strokeWidth="1.75"
        opacity="0.9"
      />
      <path
        d="M12 2.5V6.5M12 17.5V21.5M2.5 12H6.5M17.5 12H21.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="2.2" fill="currentColor" />
    </svg>
  );
}

export function Topbar({
  status,
  sidebarOpen,
  onToggleSidebar,
  onRun,
  onAbort,
  onAnalyze,
  onSelectExample,
  onShare,
  onOpenCommandPalette,
  health,
  isAnalyzing,
}: TopbarProps) {
  const [examplesOpen, setExamplesOpen] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const examplesRef = useRef<HTMLDivElement>(null);

  const { themeConfig, settings, openSettings } = useTheme();

  const isRunning =
    status === 'RUNNING' || status === 'WAITING_INPUT' || status === 'CONNECTING';

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
    <header
      style={{ height: 'var(--ui-header-h)' }}
      className="px-3 bg-[var(--bg-header)] flex items-center justify-between gap-3 select-none text-xs text-[var(--text-main)] z-30 shrink-0 transition-colors"
    >
      {/* 1. Esquerda: Toggle Explorador + Identidade Arceus + Exemplos */}
      <div className="flex items-center gap-1.5 min-w-0">
        <button
          onClick={onToggleSidebar}
          title={sidebarOpen ? 'Recolher Explorador (Alt+1)' : 'Abrir Explorador (Alt+1)'}
          className={`p-1.5 rounded-[var(--ui-radius)] transition ${
            sidebarOpen
              ? 'text-[var(--text-main)] bg-[var(--bg-subtle-soft)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]'
          }`}
        >
          {settings.sidebarPosition === 'right' ? (
            <PanelRight className="w-4 h-4" />
          ) : (
            <PanelLeft className="w-4 h-4" />
          )}
        </button>

        <div className="flex items-center gap-2 px-1.5 select-none">
          <ArceusEmblem />
          <span className="font-semibold text-[13px] tracking-tight text-[var(--text-main)] hidden sm:inline">
            Arceus
          </span>
        </div>

        {/* Seletor de Exemplos */}
        <div className="relative" ref={examplesRef}>
          <button
            onClick={() => setExamplesOpen((prev) => !prev)}
            title="Carregar exemplos de código MiniLang"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--ui-radius)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] transition text-xs font-medium"
          >
            <BookOpen className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            <span className="hidden md:inline">Exemplos</span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>

          {examplesOpen && (
            <div className="absolute left-0 mt-1.5 w-80 rounded-[var(--ui-radius-lg)] bg-[var(--bg-panel)] border border-[var(--border-color)] shadow-2xl py-1.5 z-50">
              <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Biblioteca de Exemplos MiniLang
              </div>
              <div className="max-h-80 overflow-y-auto px-1 space-y-0.5">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => {
                      onSelectExample(ex.code, ex.title);
                      setExamplesOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-[var(--ui-radius)] hover:bg-[var(--bg-subtle)] transition flex flex-col group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-[var(--text-main)] group-hover:text-[var(--accent-primary)] transition truncate">
                        {ex.title}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] bg-[var(--bg-surface)] px-1.5 py-0.2 rounded shrink-0">
                        {ex.category}
                      </span>
                    </div>
                    <span className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
                      {ex.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Centro: Barra de Busca & Paleta de Comandos Minimalista */}
      <div className="flex-1 flex justify-center max-w-md px-2">
        {onOpenCommandPalette && (
          <button
            onClick={onOpenCommandPalette}
            title="Paleta de Comandos (Ctrl+K)"
            className="w-full max-w-[300px] h-7 px-3 rounded-[var(--ui-radius)] bg-[var(--bg-surface-soft)] hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--accent-border)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition flex items-center justify-between gap-2 text-xs"
          >
            <span className="flex items-center gap-2 truncate">
              <Search className="w-3.5 h-3.5 shrink-0 opacity-70" />
              <span className="truncate text-[11.5px]">Buscar comandos, arquivos...</span>
            </span>
            <kbd className="hidden sm:inline text-[10px] px-1.5 py-0.2 rounded bg-[var(--bg-subtle-soft)] text-[var(--text-muted)] font-mono shrink-0">
              Ctrl+K
            </kbd>
          </button>
        )}
      </div>

      {/* 3. Direita: Executar/Parar + Ações Essenciais + Configurações + Status */}
      <div className="flex items-center gap-1.5 shrink-0">
        {!isRunning ? (
          <button
            onClick={onRun}
            title="Executar programa atual no terminal (F9)"
            className="flex items-center gap-1.5 px-3 py-1 rounded-[var(--ui-radius)] bg-[var(--accent-secondary-soft)] hover:bg-[var(--accent-secondary-hover)] text-[var(--accent-secondary)] border border-[var(--accent-secondary-border)] transition font-semibold text-xs active:scale-[0.98]"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Executar</span>
          </button>
        ) : (
          <button
            onClick={onAbort}
            title="Interromper execução (Esc)"
            className="flex items-center gap-1.5 px-3 py-1 rounded-[var(--ui-radius)] bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 transition font-semibold text-xs active:scale-[0.98] animate-pulse"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Parar</span>
          </button>
        )}

        <button
          onClick={onAnalyze}
          disabled={isRunning || isAnalyzing}
          title="Executar análise estática (AST, Símbolos & Diagnósticos)"
          className="p-1.5 rounded-[var(--ui-radius)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] transition disabled:opacity-40"
        >
          <SearchCode className="w-4 h-4" />
        </button>

        {onShare && (
          <button
            onClick={handleShareClick}
            title="Compartilhar código via link"
            className="p-1.5 rounded-[var(--ui-radius)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] transition"
          >
            {copiedShare ? (
              <Check className="w-4 h-4 text-[var(--accent-secondary)]" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
          </button>
        )}

        <button
          onClick={() => openSettings('appearance')}
          title={`Configurações e Aparência (Ctrl+,) — ${themeConfig.name}`}
          className="p-1.5 rounded-[var(--ui-radius)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] transition"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Indicador Sutil da API Backend */}
        <div className="pl-1 flex items-center" title={
          health.state === 'online'
            ? `Compilador Online • Python ${health.python ?? '3.13'}`
            : health.state === 'sleeping'
            ? `Despertando servidor (${health.progress ?? 0}%)...`
            : health.state === 'checking'
            ? 'Verificando conexão...'
            : 'Servidor offline'
        }>
          {health.state === 'online' && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 text-[11px] text-[var(--text-muted)]">
              <span className="w-2 h-2 rounded-full bg-[var(--accent-secondary)]" />
              <span className="hidden lg:inline">Online</span>
            </div>
          )}

          {health.state === 'sleeping' && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[var(--ui-radius)] bg-amber-500/10 text-amber-400 text-[11px]">
              <Activity className="w-3 h-3 animate-spin" />
              <span className="hidden lg:inline">{health.progress ?? 0}%</span>
            </div>
          )}

          {health.state === 'checking' && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 text-[11px] text-[var(--text-muted)]">
              <span className="w-2 h-2 rounded-full bg-[var(--text-muted)] animate-pulse" />
            </div>
          )}

          {health.state === 'offline' && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[var(--ui-radius)] bg-rose-500/10 text-rose-400 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span className="hidden lg:inline">Offline</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
