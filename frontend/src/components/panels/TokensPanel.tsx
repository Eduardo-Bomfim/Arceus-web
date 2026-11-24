import React, { useState, useMemo } from 'react';
import { Search, Binary, ChevronLeft, ChevronRight } from 'lucide-react';
import type { TokenInfo } from '../../types';

interface TokensPanelProps {
  tokens: TokenInfo[];
  isLoading?: boolean;
}

const PAGE_SIZE = 50;

export const TokensPanel = React.memo(function TokensPanel({
  tokens,
  isLoading,
}: TokensPanelProps) {
  const [filter, setFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const tokenTypes = useMemo(() => {
    const set = new Set(tokens.map((t) => t.type));
    return Array.from(set);
  }, [tokens]);

  const filteredTokens = useMemo(() => {
    return tokens.filter((t) => {
      const matchText =
        t.value.toLowerCase().includes(filter.toLowerCase()) ||
        t.type.toLowerCase().includes(filter.toLowerCase());
      const matchType = typeFilter === 'all' || t.type === typeFilter;
      return matchText && matchType;
    });
  }, [tokens, filter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredTokens.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  const pagedTokens = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredTokens.slice(start, start + PAGE_SIZE);
  }, [filteredTokens, safePage]);

  if (isLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8 space-y-3 bg-[var(--bg-surface)]">
        <div className="w-6 h-6 rounded-full border-2 border-[var(--accent-primary)] border-t-transparent animate-spin" />
        <span className="text-xs text-[var(--text-muted)]">Analisando tokens léxicos...</span>
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-[var(--text-muted)] p-6 text-xs text-center bg-[var(--bg-surface)]">
        Nenhum token disponível. Escreva ou analise um programa para visualizar.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-surface)] text-[var(--text-main)] text-xs overflow-hidden select-text transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 bg-[var(--bg-panel-soft)] border-b border-[var(--border-faint)] select-none shrink-0">
        <div className="flex items-center gap-2">
          <Binary className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-semibold text-[var(--text-main)]">
            Tokens Léxicos ({tokens.length})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {tokenTypes.length > 1 && (
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--ui-radius)] px-2 py-1 text-[var(--text-main)] outline-none text-[11px]"
            >
              <option value="all">Todos os tipos</option>
              {tokenTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          )}

          <div className="relative">
            <Search className="w-3 h-3 absolute left-2.5 top-2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Filtrar token / lexema..."
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--ui-radius)] pl-7 pr-2.5 py-1 text-[var(--text-main)] placeholder-[var(--text-muted)] outline-none text-[11px] w-40 font-mono"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-[var(--bg-panel)] text-[var(--text-muted)] sticky top-0 border-b border-[var(--border-subtle)] select-none text-[11px]">
            <tr>
              <th className="py-2 px-3.5 w-12 font-semibold">#</th>
              <th className="py-2 px-3.5 font-semibold">Tipo</th>
              <th className="py-2 px-3.5 font-semibold">Lexema</th>
              <th className="py-2 px-3.5 font-semibold">Linha</th>
              <th className="py-2 px-3.5 font-semibold">Coluna</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-faint)]">
            {pagedTokens.map((tok, idx) => {
              const globalIdx = (safePage - 1) * PAGE_SIZE + idx + 1;
              return (
                <tr key={idx} className="hover:bg-[var(--bg-subtle-soft)] transition">
                  <td className="py-1.5 px-3.5 text-[var(--text-muted)] font-mono text-[11px]">
                    {globalIdx}
                  </td>
                  <td className="py-1.5 px-3.5">
                    <span
                      className={`px-1.5 py-0.5 rounded-[var(--ui-radius)] text-[10px] font-mono font-semibold ${
                        tok.type === 'KEYWORD'
                          ? 'bg-amber-500/15 text-amber-400'
                          : tok.type === 'ID'
                          ? 'bg-sky-500/15 text-sky-400'
                          : tok.type === 'INT'
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : tok.type === 'ERROR'
                          ? 'bg-rose-500/15 text-rose-400'
                          : 'bg-[var(--bg-panel)] text-[var(--text-muted)]'
                      }`}
                    >
                      {tok.type}
                    </span>
                  </td>
                  <td className="py-1.5 px-3.5 font-mono font-medium text-[var(--text-main)]">
                    {tok.value === '' && tok.type === 'EOF' ? (
                      <span className="text-[var(--text-muted)] italic">&lt;EOF&gt;</span>
                    ) : (
                      tok.value
                    )}
                  </td>
                  <td className="py-1.5 px-3.5 text-[var(--text-muted)] font-mono text-[11px]">
                    {tok.line}
                  </td>
                  <td className="py-1.5 px-3.5 text-[var(--text-muted)] font-mono text-[11px]">
                    {tok.column}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-3.5 py-1.5 bg-[var(--bg-panel-soft)] border-t border-[var(--border-faint)] text-[11px] text-[var(--text-muted)] select-none shrink-0">
          <span>
            Exibindo {(safePage - 1) * PAGE_SIZE + 1} –{' '}
            {Math.min(safePage * PAGE_SIZE, filteredTokens.length)} de {filteredTokens.length} tokens
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={safePage === 1}
              className="p-1 rounded-[var(--ui-radius)] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] disabled:opacity-30 transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span>
              Página {safePage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={safePage === totalPages}
              className="p-1 rounded-[var(--ui-radius)] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] disabled:opacity-30 transition"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
