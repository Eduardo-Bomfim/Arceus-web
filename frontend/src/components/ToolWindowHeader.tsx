import {
  Terminal as TerminalIcon,
  AlertCircle,
  GitCompare,
  Database,
  Binary,
  Network,
  PanelBottom,
  PanelRight,
  Maximize2,
  Minimize2,
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
  const tabs: Array<{
    id: TabType;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    isError?: boolean;
  }> = [
    {
      id: 'console',
      label: 'Terminal',
      icon: <TerminalIcon className="w-3.5 h-3.5 text-[var(--accent-primary)]" />,
    },
    {
      id: 'problems',
      label: 'Problemas',
      icon: <AlertCircle className="w-3.5 h-3.5 text-rose-400" />,
      badge: errorsCount > 0 ? errorsCount : undefined,
      isError: errorsCount > 0,
    },
    {
      id: 'ast',
      label: 'AST',
      icon: <GitCompare className="w-3.5 h-3.5 text-[var(--accent-secondary)]" />,
    },
    {
      id: 'cfg',
      label: 'CFG',
      icon: <Network className="w-3.5 h-3.5 text-purple-400" />,
    },
    {
      id: 'symbols',
      label: 'Símbolos',
      icon: <Database className="w-3.5 h-3.5 text-amber-400" />,
    },
    {
      id: 'tokens',
      label: 'Tokens',
      icon: <Binary className="w-3.5 h-3.5 text-sky-400" />,
      badge: tokensCount && tokensCount > 0 ? tokensCount : undefined,
    },
  ];

  return (
    <div
      style={{ height: 'var(--ui-tab-h)' }}
      className="flex items-center justify-between bg-[var(--bg-panel)] border-b border-[var(--border-subtle)] px-2 select-none overflow-x-auto no-scrollbar text-xs shrink-0 transition-colors"
    >
      {/* Abas limpas sem numeração poluída */}
      <div className="flex items-center gap-1 h-full overflow-x-auto no-scrollbar py-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-1.5 h-full px-2.5 rounded-[var(--ui-radius)] transition text-xs font-medium shrink-0 ${
                isActive
                  ? 'bg-[var(--bg-surface)] text-[var(--text-main)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle-soft)]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    tab.isError
                      ? 'bg-rose-500/20 text-rose-400 font-semibold'
                      : 'bg-[var(--bg-subtle)] text-[var(--text-muted)]'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Controles de layout do painel */}
      <div className="flex items-center gap-0.5 text-[var(--text-muted)] pl-2 shrink-0">
        <button
          onClick={onTogglePanelPosition}
          title={
            panelPosition === 'bottom'
              ? 'Mover painel para a lateral direita'
              : 'Mover painel para a parte inferior'
          }
          className="p-1.5 rounded-[var(--ui-radius)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] transition"
        >
          {panelPosition === 'bottom' ? (
            <PanelRight className="w-3.5 h-3.5" />
          ) : (
            <PanelBottom className="w-3.5 h-3.5" />
          )}
        </button>

        <button
          onClick={onToggleMaximize}
          title={isMaximized ? 'Restaurar tamanho' : 'Expandir painel'}
          className="p-1.5 rounded-[var(--ui-radius)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] transition"
        >
          {isMaximized ? (
            <Minimize2 className="w-3.5 h-3.5" />
          ) : (
            <Maximize2 className="w-3.5 h-3.5" />
          )}
        </button>

        <button
          onClick={onClose}
          title="Recolher painel (Alt+4)"
          className="p-1.5 rounded-[var(--ui-radius)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] transition"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
