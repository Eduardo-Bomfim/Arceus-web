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
} from 'lucide-react';
import type { TabType } from '../hooks/useTabs';
import { useTheme } from '../context/ThemeContext';

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
  const { themeConfig } = useTheme();

  return (
    <div className="flex items-center justify-between bg-[var(--bg-header)] border-b border-[var(--border-color)] px-2 select-none overflow-x-auto text-xs no-scrollbar shrink-0">
      {/* Abas com Números de Atalho estilo IntelliJ IDEA */}
      <div className="flex items-center overflow-x-auto no-scrollbar">
        {/* 4: Console */}
        <button
          onClick={() => onSelectTab('console')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition ${
            activeTab === 'console'
              ? 'bg-[var(--bg-active-tab)] text-white'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)]'
          }`}
          style={
            activeTab === 'console'
              ? { borderBottomColor: themeConfig.primaryColor, color: themeConfig.primaryColor }
              : undefined
          }
        >
          <TerminalIcon className="w-3.5 h-3.5" />
          <span>4: Console</span>
        </button>

        {/* 6: Problemas */}
        <button
          onClick={() => onSelectTab('problems')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition ${
            activeTab === 'problems'
              ? 'border-rose-400 text-rose-400 bg-[var(--bg-active-tab)]'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)]'
          }`}
        >
          <AlertOctagon className="w-3.5 h-3.5" />
          <span>6: Problemas</span>
          {errorsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-950 text-rose-300 font-bold border border-rose-800/40">
              {errorsCount}
            </span>
          )}
        </button>

        {/* AST */}
        <button
          onClick={() => onSelectTab('ast')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition ${
            activeTab === 'ast'
              ? 'bg-[var(--bg-active-tab)] text-white'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)]'
          }`}
          style={
            activeTab === 'ast'
              ? { borderBottomColor: themeConfig.secondaryColor, color: themeConfig.secondaryColor }
              : undefined
          }
        >
          <GitCompare className="w-3.5 h-3.5" />
          <span>AST (Árvore)</span>
        </button>

        {/* CFG */}
        <button
          onClick={() => onSelectTab('cfg')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition ${
            activeTab === 'cfg'
              ? 'bg-[var(--bg-active-tab)] text-white'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)]'
          }`}
          style={
            activeTab === 'cfg'
              ? { borderBottomColor: themeConfig.primaryColor, color: themeConfig.primaryColor }
              : undefined
          }
        >
          <Network className="w-3.5 h-3.5" />
          <span>CFG (Fluxo)</span>
        </button>

        {/* Símbolos */}
        <button
          onClick={() => onSelectTab('symbols')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition ${
            activeTab === 'symbols'
              ? 'bg-[var(--bg-active-tab)] text-white'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)]'
          }`}
          style={
            activeTab === 'symbols'
              ? { borderBottomColor: themeConfig.primaryColor, color: themeConfig.primaryColor }
              : undefined
          }
        >
          <Database className="w-3.5 h-3.5" />
          <span>Símbolos</span>
        </button>

        {/* Tokens */}
        <button
          onClick={() => onSelectTab('tokens')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition ${
            activeTab === 'tokens'
              ? 'bg-[var(--bg-active-tab)] text-white'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)]'
          }`}
          style={
            activeTab === 'tokens'
              ? { borderBottomColor: themeConfig.secondaryColor, color: themeConfig.secondaryColor }
              : undefined
          }
        >
          <Binary className="w-3.5 h-3.5" />
          <span>Tokens</span>
          {tokensCount !== undefined && tokensCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-sky-950 text-sky-300 font-semibold border border-sky-800/40">
              {tokensCount}
            </span>
          )}
        </button>
      </div>

      {/* Ações da Janela de Ferramentas - Estilo IntelliJ IDEA */}
      <div className="flex items-center gap-1 px-1">
        {/* Alternar Posição (Inferior vs Lateral Direita) */}
        <button
          onClick={onTogglePanelPosition}
          title={
            panelPosition === 'bottom'
              ? 'Mover painel para a Direita (Lateral)'
              : 'Mover painel para a Parte Inferior (Abaixo do Editor)'
          }
          className="p-1 rounded text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-surface)] transition"
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
          title={isMaximized ? 'Restaurar tamanho padrão' : 'Maximizar painel'}
          className="p-1 rounded text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-surface)] transition"
        >
          {isMaximized ? (
            <Minimize2 className="w-3.5 h-3.5" />
          ) : (
            <Maximize2 className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Recolher / Minimizar */}
        <button
          onClick={onClose}
          title="Recolher painel de ferramentas"
          className="p-1 rounded text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-surface)] transition"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
