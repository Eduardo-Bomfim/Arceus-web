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
  Layers,
} from 'lucide-react';
import type { HealthStatus, RunnerStatus } from '../types';
import { EXAMPLES } from '../examples';

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
  health: HealthStatus;
  isAnalyzing: boolean;
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
  health,
  isAnalyzing,
}: TopbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isRunning = status === 'RUNNING' || status === 'WAITING_INPUT' || status === 'CONNECTING';

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex flex-wrap items-center justify-between px-4 py-2 bg-[#0c1017] border-b border-[#1e293b] select-none gap-2 z-20">
      {/* Lado Esquerdo: Brand + Controles Primários */}
      <div className="flex items-center gap-3">
        {/* Logo / Título */}
        <div className="flex items-center gap-2 mr-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
              Arceus <span className="text-[11px] font-normal text-sky-400 bg-sky-950/60 px-1.5 py-0.2 rounded border border-sky-800/40">MiniLang</span>
            </h1>
          </div>
        </div>

        {/* Botão Executar / Interromper */}
        {!isRunning ? (
          <button
            onClick={onRun}
            title="Executar Programa (F9 ou Ctrl+Enter)"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-sm shadow-emerald-950 active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Executar</span>
            <kbd className="hidden sm:inline-block ml-1 px-1 rounded bg-emerald-700/60 text-[10px] text-emerald-200">
              F9
            </kbd>
          </button>
        ) : (
          <button
            onClick={onAbort}
            title="Interromper Execução (Esc)"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition shadow-sm shadow-rose-950 active:scale-95 animate-pulse"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Parar</span>
          </button>
        )}

        {/* Botão Analisar (apenas estático) */}
        <button
          onClick={onAnalyze}
          disabled={isRunning || isAnalyzing}
          title="Executa apenas a validação estática de tipos, AST e tabela de símbolos"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#182232] hover:bg-[#223044] text-slate-300 text-xs transition border border-[#263750] disabled:opacity-50"
        >
          <SearchCode className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline">Analisar</span>
        </button>

        {/* Switch de Constant Folding */}
        <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 hover:text-white transition px-2 py-1 rounded bg-[#131b27] border border-[#202c3e]">
          <input
            type="checkbox"
            checked={optimize}
            onChange={(e) => onToggleOptimize(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-7 h-4 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600 relative"></div>
          <span className="flex items-center gap-1 text-[11px] font-medium text-slate-300">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span className="hidden md:inline">Constant Folding</span> (--opt)
          </span>
        </label>
      </div>

      {/* Lado Direito: Exemplos, Arquivos e Status da API */}
      <div className="flex items-center gap-2">
        {/* Dropdown de Exemplos */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#182232] hover:bg-[#223044] text-slate-200 text-xs transition border border-[#263750]"
          >
            <span>Exemplos Prontos</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-72 rounded-lg bg-[#111827] border border-[#263750] shadow-xl shadow-black/80 py-1.5 z-50 divide-y divide-[#1e293b]">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Templates da MiniLang
              </div>
              <div className="py-1">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => {
                      onSelectExample(ex.code);
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-[#1a2538] transition flex flex-col group"
                  >
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-sky-400 transition flex items-center justify-between">
                      {ex.title}
                      <span className="text-[10px] font-normal text-slate-500 bg-[#162030] px-1.5 rounded">
                        {ex.category}
                      </span>
                    </span>
                    <span className="text-[11px] text-slate-400 truncate mt-0.5">
                      {ex.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Botão Abrir arquivo local */}
        <button
          onClick={onOpenFile}
          title="Abrir arquivo MiniLang (.ml) do seu computador"
          className="p-1.5 rounded-md bg-[#182232] hover:bg-[#223044] text-slate-300 transition border border-[#263750]"
        >
          <FolderOpen className="w-3.5 h-3.5" />
        </button>

        {/* Botão Baixar arquivo fonte */}
        <button
          onClick={onDownloadFile}
          title="Baixar código fonte (.ml)"
          className="p-1.5 rounded-md bg-[#182232] hover:bg-[#223044] text-slate-300 transition border border-[#263750]"
        >
          <Download className="w-3.5 h-3.5" />
        </button>

        {/* Badge de Status do Render / Backend */}
        <div className="pl-2 border-l border-[#1e293b]">
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
