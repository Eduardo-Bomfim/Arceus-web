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
    <div className="h-[30px] flex items-center justify-between bg-[#2b2d30] border-b border-[#393b40] px-1 select-none overflow-x-auto no-scrollbar text-xs shrink-0 font-sans">
      {/* Abas com Números de Atalho estilo JetBrains */}
      <div className="flex items-center h-full overflow-x-auto no-scrollbar">
        {/* 4: Run */}
        <button
          onClick={() => onSelectTab('console')}
          className={`flex items-center gap-1.5 h-full px-3 transition text-xs font-medium border-b-2 ${
            activeTab === 'console'
              ? 'border-b-[#3574f0] text-[#dfe1e5] bg-[#1e1f22]'
              : 'border-b-transparent text-[#868a91] hover:text-[#dfe1e5] hover:bg-[#35373c]'
          }`}
        >
          <TerminalIcon className="w-3.5 h-3.5 text-[#3574f0]" />
          <span>4: Run</span>
        </button>

        {/* 6: Problems */}
        <button
          onClick={() => onSelectTab('problems')}
          className={`flex items-center gap-1.5 h-full px-3 transition text-xs font-medium border-b-2 ${
            activeTab === 'problems'
              ? 'border-b-[#f75464] text-[#f75464] bg-[#1e1f22]'
              : 'border-b-transparent text-[#868a91] hover:text-[#dfe1e5] hover:bg-[#35373c]'
          }`}
        >
          <AlertOctagon className="w-3.5 h-3.5" />
          <span>6: Problems</span>
          {errorsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#f75464]/20 text-[#f75464] font-bold border border-[#f75464]/30">
              {errorsCount}
            </span>
          )}
        </button>

        {/* AST Inspector */}
        <button
          onClick={() => onSelectTab('ast')}
          className={`flex items-center gap-1.5 h-full px-3 transition text-xs font-medium border-b-2 ${
            activeTab === 'ast'
              ? 'border-b-[#3574f0] text-[#dfe1e5] bg-[#1e1f22]'
              : 'border-b-transparent text-[#868a91] hover:text-[#dfe1e5] hover:bg-[#35373c]'
          }`}
        >
          <GitCompare className="w-3.5 h-3.5 text-[#59a869]" />
          <span>AST</span>
        </button>

        {/* CFG (Flow) */}
        <button
          onClick={() => onSelectTab('cfg')}
          className={`flex items-center gap-1.5 h-full px-3 transition text-xs font-medium border-b-2 ${
            activeTab === 'cfg'
              ? 'border-b-[#3574f0] text-[#dfe1e5] bg-[#1e1f22]'
              : 'border-b-transparent text-[#868a91] hover:text-[#dfe1e5] hover:bg-[#35373c]'
          }`}
        >
          <Network className="w-3.5 h-3.5 text-[#a855f7]" />
          <span>CFG</span>
        </button>

        {/* Symbol Table */}
        <button
          onClick={() => onSelectTab('symbols')}
          className={`flex items-center gap-1.5 h-full px-3 transition text-xs font-medium border-b-2 ${
            activeTab === 'symbols'
              ? 'border-b-[#3574f0] text-[#dfe1e5] bg-[#1e1f22]'
              : 'border-b-transparent text-[#868a91] hover:text-[#dfe1e5] hover:bg-[#35373c]'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-[#e5a83b]" />
          <span>Symbols</span>
        </button>

        {/* Tokens */}
        <button
          onClick={() => onSelectTab('tokens')}
          className={`flex items-center gap-1.5 h-full px-3 transition text-xs font-medium border-b-2 ${
            activeTab === 'tokens'
              ? 'border-b-[#3574f0] text-[#dfe1e5] bg-[#1e1f22]'
              : 'border-b-transparent text-[#868a91] hover:text-[#dfe1e5] hover:bg-[#35373c]'
          }`}
        >
          <Binary className="w-3.5 h-3.5 text-[#38bdf8]" />
          <span>Tokens</span>
          {tokensCount !== undefined && tokensCount > 0 && (
            <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-[#38bdf8]/20 text-[#38bdf8] font-mono">
              {tokensCount}
            </span>
          )}
        </button>
      </div>

      {/* Ações da Janela de Ferramentas - Estilo JetBrains */}
      <div className="flex items-center gap-0.5 text-[#868a91] px-1">
        {/* Alternar Posição */}
        <button
          onClick={onTogglePanelPosition}
          title={
            panelPosition === 'bottom'
              ? 'Move to Right'
              : 'Move to Bottom'
          }
          className="p-1 rounded-[4px] hover:text-[#dfe1e5] hover:bg-[#35373c] transition"
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
          className="p-1 rounded-[4px] hover:text-[#dfe1e5] hover:bg-[#35373c] transition"
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
          className="p-1 rounded-[4px] hover:text-[#dfe1e5] hover:bg-[#35373c] transition"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        {/* Fechar */}
        <button
          onClick={onClose}
          title="Close Tool Window (Shift+Escape)"
          className="p-1 rounded-[4px] hover:text-[#dfe1e5] hover:bg-[#35373c] transition"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
