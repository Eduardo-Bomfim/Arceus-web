import {
  Terminal,
  AlertOctagon,
  GitCompare,
  Database,
  Binary,
  Network,
  ChevronUp,
} from 'lucide-react';
import type { TabType } from '../hooks/useTabs';
import { useTheme } from '../context/ThemeContext';

interface BottomToolStripeProps {
  activeTab: TabType;
  onOpenTab: (tab: TabType) => void;
  errorsCount: number;
}

export function BottomToolStripe({
  activeTab,
  onOpenTab,
  errorsCount,
}: BottomToolStripeProps) {
  const { themeConfig } = useTheme();

  return (
    <div className="flex items-center justify-between px-2 bg-[var(--bg-header)] border-t border-[var(--border-color)] select-none text-xs text-[var(--text-muted)] h-7 shrink-0">
      <div className="flex items-center gap-1">
        <button
          onClick={() => onOpenTab('console')}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] transition hover:bg-[var(--bg-surface)] ${
            activeTab === 'console' ? 'text-white font-medium bg-[var(--bg-surface)]' : 'text-[var(--text-muted)]'
          }`}
          style={activeTab === 'console' ? { color: themeConfig.primaryColor } : undefined}
        >
          <Terminal className="w-3 h-3" />
          <span>4: Console</span>
        </button>

        <button
          onClick={() => onOpenTab('problems')}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] transition hover:bg-[var(--bg-surface)] ${
            activeTab === 'problems' ? 'text-rose-400 font-medium bg-[var(--bg-surface)]' : 'text-[var(--text-muted)]'
          }`}
        >
          <AlertOctagon className="w-3 h-3" />
          <span>6: Problemas</span>
          {errorsCount > 0 && (
            <span className="px-1 py-0.2 rounded-full text-[9px] bg-rose-950 text-rose-300 font-bold border border-rose-800/40">
              {errorsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onOpenTab('ast')}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] transition hover:bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-white"
        >
          <GitCompare className="w-3 h-3" />
          <span>AST</span>
        </button>

        <button
          onClick={() => onOpenTab('cfg')}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] transition hover:bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-white"
        >
          <Network className="w-3 h-3" />
          <span>CFG</span>
        </button>

        <button
          onClick={() => onOpenTab('symbols')}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] transition hover:bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-white"
        >
          <Database className="w-3 h-3" />
          <span>Símbolos</span>
        </button>

        <button
          onClick={() => onOpenTab('tokens')}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] transition hover:bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-white"
        >
          <Binary className="w-3 h-3" />
          <span>Tokens</span>
        </button>
      </div>

      <button
        onClick={() => onOpenTab(activeTab)}
        title="Restaurar painel de ferramentas"
        className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded hover:bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-white transition"
      >
        <span>Abrir Ferramentas</span>
        <ChevronUp className="w-3 h-3" />
      </button>
    </div>
  );
}
