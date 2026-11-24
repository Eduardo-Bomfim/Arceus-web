import {
  Terminal,
  AlertCircle,
  GitCompare,
  Database,
  Binary,
  Network,
  ChevronUp,
} from 'lucide-react';
import type { TabType } from '../hooks/useTabs';

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
  return (
    <div className="flex items-center justify-between px-2.5 bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-[var(--ui-radius-lg)] select-none text-xs text-[var(--text-muted)] h-8 shrink-0 transition-colors">
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
        <button
          onClick={() => onOpenTab('console')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--ui-radius)] text-[11px] transition hover:bg-[var(--bg-subtle)] ${
            activeTab === 'console'
              ? 'text-[var(--text-main)] font-medium'
              : 'text-[var(--text-muted)]'
          }`}
        >
          <Terminal className="w-3 h-3 text-[var(--accent-primary)]" />
          <span>Terminal</span>
        </button>

        <button
          onClick={() => onOpenTab('problems')}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--ui-radius)] text-[11px] transition hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
        >
          <AlertCircle className="w-3 h-3 text-rose-400" />
          <span>Problemas</span>
          {errorsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[9.5px] bg-rose-500/20 text-rose-400 font-semibold">
              {errorsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onOpenTab('ast')}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--ui-radius)] text-[11px] transition hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
        >
          <GitCompare className="w-3 h-3 text-[var(--accent-secondary)]" />
          <span>AST</span>
        </button>

        <button
          onClick={() => onOpenTab('cfg')}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--ui-radius)] text-[11px] transition hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
        >
          <Network className="w-3 h-3 text-purple-400" />
          <span>CFG</span>
        </button>

        <button
          onClick={() => onOpenTab('symbols')}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--ui-radius)] text-[11px] transition hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
        >
          <Database className="w-3 h-3 text-amber-400" />
          <span>Símbolos</span>
        </button>

        <button
          onClick={() => onOpenTab('tokens')}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--ui-radius)] text-[11px] transition hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
        >
          <Binary className="w-3 h-3 text-sky-400" />
          <span>Tokens</span>
        </button>
      </div>

      <button
        onClick={() => onOpenTab(activeTab)}
        title="Expandir painel"
        className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-[var(--ui-radius)] hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition shrink-0"
      >
        <span className="hidden sm:inline">Abrir painel</span>
        <ChevronUp className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
