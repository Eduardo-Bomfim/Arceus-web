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
    <div className="flex items-center justify-between px-2 bg-[var(--bg-header)] border-t border-[var(--border-color)] select-none text-xs text-[var(--text-muted)] h-[26px] shrink-0 font-sans transition-colors">
      <div className="flex items-center gap-1">
        <button
          onClick={() => onOpenTab('console')}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[11px] transition hover:bg-[var(--bg-subtle)] ${
            activeTab === 'console' ? 'text-[var(--text-main)] font-semibold bg-[var(--bg-subtle)]' : 'text-[var(--text-muted)]'
          }`}
        >
          <Terminal className="w-3 h-3 text-[var(--accent-primary)]" />
          <span>4: Run</span>
        </button>

        <button
          onClick={() => onOpenTab('problems')}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[11px] transition hover:bg-[var(--bg-subtle)] ${
            activeTab === 'problems' ? 'text-red-400 font-semibold bg-[var(--bg-subtle)]' : 'text-[var(--text-muted)]'
          }`}
        >
          <AlertOctagon className="w-3 h-3" />
          <span>6: Problems</span>
          {errorsCount > 0 && (
            <span className="px-1 py-0.2 rounded-full text-[9px] bg-red-500/20 text-red-400 font-bold">
              {errorsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onOpenTab('ast')}
          className="flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[11px] transition hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
        >
          <GitCompare className="w-3 h-3 text-[var(--accent-secondary)]" />
          <span>AST</span>
        </button>

        <button
          onClick={() => onOpenTab('cfg')}
          className="flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[11px] transition hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
        >
          <Network className="w-3 h-3 text-purple-400" />
          <span>CFG</span>
        </button>

        <button
          onClick={() => onOpenTab('symbols')}
          className="flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[11px] transition hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
        >
          <Database className="w-3 h-3 text-amber-400" />
          <span>Symbols</span>
        </button>

        <button
          onClick={() => onOpenTab('tokens')}
          className="flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[11px] transition hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
        >
          <Binary className="w-3 h-3 text-sky-400" />
          <span>Tokens</span>
        </button>
      </div>

      <button
        onClick={() => onOpenTab(activeTab)}
        title="Restore Tool Window"
        className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-[4px] hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition"
      >
        <span>Open Tool Window</span>
        <ChevronUp className="w-3 h-3" />
      </button>
    </div>
  );
}
