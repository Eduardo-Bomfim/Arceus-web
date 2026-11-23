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
    <div className="flex items-center justify-between px-2 bg-[#2b2d30] border-t border-[#393b40] select-none text-xs text-[#868a91] h-[26px] shrink-0 font-sans">
      <div className="flex items-center gap-1">
        <button
          onClick={() => onOpenTab('console')}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[11px] transition hover:bg-[#35373c] ${
            activeTab === 'console' ? 'text-[#dfe1e5] font-medium bg-[#1e1f22]' : 'text-[#868a91]'
          }`}
        >
          <Terminal className="w-3 h-3 text-[#3574f0]" />
          <span>4: Run</span>
        </button>

        <button
          onClick={() => onOpenTab('problems')}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[11px] transition hover:bg-[#35373c] ${
            activeTab === 'problems' ? 'text-[#f75464] font-medium bg-[#1e1f22]' : 'text-[#868a91]'
          }`}
        >
          <AlertOctagon className="w-3 h-3" />
          <span>6: Problems</span>
          {errorsCount > 0 && (
            <span className="px-1 py-0.2 rounded-full text-[9px] bg-[#f75464]/20 text-[#f75464] font-bold">
              {errorsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onOpenTab('ast')}
          className="flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[11px] transition hover:bg-[#35373c] text-[#868a91] hover:text-[#dfe1e5]"
        >
          <GitCompare className="w-3 h-3 text-[#59a869]" />
          <span>AST</span>
        </button>

        <button
          onClick={() => onOpenTab('cfg')}
          className="flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[11px] transition hover:bg-[#35373c] text-[#868a91] hover:text-[#dfe1e5]"
        >
          <Network className="w-3 h-3 text-[#a855f7]" />
          <span>CFG</span>
        </button>

        <button
          onClick={() => onOpenTab('symbols')}
          className="flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[11px] transition hover:bg-[#35373c] text-[#868a91] hover:text-[#dfe1e5]"
        >
          <Database className="w-3 h-3 text-[#e5a83b]" />
          <span>Symbols</span>
        </button>

        <button
          onClick={() => onOpenTab('tokens')}
          className="flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[11px] transition hover:bg-[#35373c] text-[#868a91] hover:text-[#dfe1e5]"
        >
          <Binary className="w-3 h-3 text-[#38bdf8]" />
          <span>Tokens</span>
        </button>
      </div>

      <button
        onClick={() => onOpenTab(activeTab)}
        title="Restore Tool Window"
        className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-[4px] hover:bg-[#35373c] text-[#868a91] hover:text-[#dfe1e5] transition"
      >
        <span>Open Tool Window</span>
        <ChevronUp className="w-3 h-3" />
      </button>
    </div>
  );
}
