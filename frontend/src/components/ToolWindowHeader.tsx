import {
  Terminal as TerminalIcon,
  AlertOctagon,
  GitCompare,
  Database,
  Binary,
  Network,
  PanelBottom,
  PanelRight,
  Maximize2,
  Minimize2,
  Minus,
  X,
} from 'lucide-react';
import type { TabType } from '../hooks/useTabs';

interface ToolWindowHeaderProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  errorsCount: number;
  tokensCount?: number;
  panelPosition: 'bottom' | 'right';
  onTogglePanelPosition: () => void;
  isMaximized: boolean;
  onToggleMaximize: () => void;
  onClose: () => void;
}

export function ToolWindowHeader({
  activeTab,
  onSelectTab,
  errorsCount,
  tokensCount,
  panelPosition,
  onTogglePanelPosition,
  isMaximized,
  onToggleMaximize,
  onClose,
}: ToolWindowHeaderProps) {
  return (
    <div className="h-[30px] flex items-center justify-between bg-[var(--bg-header)] border-b border-[var(--border-color)] px-1 select-none overflow-x-auto no-scrollbar text-xs shrink-0 font-sans transition-colors">
      {/* Abas com Números de Atalho estilo JetBrains */}
      <div className="flex items-center h-full overflow-x-auto no-scrollbar">
        {/* 4: Run */}
        <button
          onClick={() => onSelectTab('console')}
          className={`flex items-center gap-1.5 h-full px-3 transition text-xs font-medium border-b-2 ${
            activeTab === 'console'
              ? 'border-b-[var(--accent-primary)] text-[var(--text-main)] bg-[var(--bg-panel)]'
              : 'border-b-transparent text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]'
          }`}
        >
          <TerminalIcon className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
          <span>4: Run</span>
        </button>

        {/* 6: Problems */}
        <button
          onClick={() => onSelectTab('problems')}
          className={`flex items-center gap-1.5 h-full px-3 transition text-xs font-medium border-b-2 ${
            activeTab === 'problems'
              ? 'border-b-red-400 text-red-400 bg-[var(--bg-panel)]'
              : 'border-b-transparent text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]'
          }`}
        >
          <AlertOctagon className="w-3.5 h-3.5" />
          <span>6: Problems</span>
          {errorsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-500/20 text-red-400 font-bold border border-red-500/30">
              {errorsCount}
            </span>
          )}
        </button>

        {/* AST Inspector */}
        <button
          onClick={() => onSelectTab('ast')}
          className={`flex items-center gap-1.5 h-full px-3 transition text-xs font-medium border-b-2 ${
            activeTab === 'ast'
              ? 'border-b-[var(--accent-primary)] text-[var(--text-main)] bg-[var(--bg-panel)]'
              : 'border-b-transparent text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]'
          }`}
        >
          <GitCompare className="w-3.5 h-3.5 text-[var(--accent-secondary)]" />
          <span>AST</span>
        </button>

        {/* CFG (Flow) */}
        <button
          onClick={() => onSelectTab('cfg')}
          className={`flex items-center gap-1.5 h-full px-3 transition text-xs font-medium border-b-2 ${
            activeTab === 'cfg'
              ? 'border-b-[var(--accent-primary)] text-[var(--text-main)] bg-[var(--bg-panel)]'
              : 'border-b-transparent text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]'
          }`}
        >
          <Network className="w-3.5 h-3.5 text-purple-400" />
          <span>CFG</span>
        </button>

        {/* Symbol Table */}
        <button
          onClick={() => onSelectTab('symbols')}
          className={`flex items-center gap-1.5 h-full px-3 transition text-xs font-medium border-b-2 ${
            activeTab === 'symbols'
              ? 'border-b-[var(--accent-primary)] text-[var(--text-main)] bg-[var(--bg-panel)]'
              : 'border-b-transparent text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-amber-400" />
          <span>Symbols</span>
        </button>

        {/* Tokens */}
        <button
          onClick={() => onSelectTab('tokens')}
          className={`flex items-center gap-1.5 h-full px-3 transition text-xs font-medium border-b-2 ${
            activeTab === 'tokens'
              ? 'border-b-[var(--accent-primary)] text-[var(--text-main)] bg-[var(--bg-panel)]'
              : 'border-b-transparent text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]'
          }`}
        >
          <Binary className="w-3.5 h-3.5 text-sky-400" />
          <span>Tokens</span>
          {tokensCount !== undefined && tokensCount > 0 && (
            <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-sky-500/20 text-sky-400 font-mono">
              {tokensCount}
            </span>
          )}
        </button>
      </div>

      {/* Ações da Janela de Ferramentas - Estilo JetBrains */}
      <div className="flex items-center gap-0.5 text-[var(--text-muted)] px-1">
        {/* Alternar Posição */}
        <button
          onClick={onTogglePanelPosition}
          title={
            panelPosition === 'bottom'
              ? 'Move to Right'
              : 'Move to Bottom'
          }
          className="p-1 rounded-[4px] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] transition"
        >
          {panelPosition === 'bottom' ? (
            <PanelRight className="w-3.5 h-3.5" />
          ) : (
            <PanelBottom className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Maximizar / Restaurar */}
        <button
          onClick={onToggleMaximize}
          title={isMaximized ? 'Restore View' : 'Maximize Tool Window'}
          className="p-1 rounded-[4px] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] transition"
        >
          {isMaximized ? (
            <Minimize2 className="w-3.5 h-3.5" />
          ) : (
            <Maximize2 className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Minimizar */}
        <button
          onClick={onClose}
          title="Minimize Tool Window"
          className="p-1 rounded-[4px] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] transition"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        {/* Fechar */}
        <button
          onClick={onClose}
          title="Close Tool Window (Shift+Escape)"
          className="p-1 rounded-[4px] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] transition"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
