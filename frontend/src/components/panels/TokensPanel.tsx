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
      <div className="flex flex-col h-full items-center justify-center p-8 space-y-3 bg-[#1e1f22]">
        <div className="w-6 h-6 rounded-full border-2 border-[#3574f0] border-t-transparent animate-spin" />
        <span className="text-xs text-[#868a91]">Scanning Lexical Tokens...</span>
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-[#868a91] p-6 text-xs text-center font-sans bg-[#1e1f22]">
        No tokens available. Run inspection or execute code to view token sequence.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#1e1f22] text-[#dfe1e5] font-sans text-xs overflow-hidden select-text">
      {/* Header com Filtros */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 bg-[#2b2d30] border-b border-[#393b40] select-none shrink-0">
        <div className="flex items-center gap-2">
          <Binary className="w-3.5 h-3.5 text-[#38bdf8]" />
          <span className="font-semibold text-[#dfe1e5]">
            Lexer Tokens ({tokens.length})
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
              className="bg-[#1e1f22] border border-[#393b40] rounded-[4px] px-2 py-0.5 text-[#dfe1e5] outline-none text-[11px]"
            >
              <option value="all">All Token Types</option>
              {tokenTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          )}

          <div className="relative">
            <Search className="w-3 h-3 absolute left-2 top-1.5 text-[#868a91]" />
            <input
              type="text"
              placeholder="Search token / lexeme..."
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#1e1f22] border border-[#393b40] rounded-[4px] pl-6 pr-2 py-0.5 text-[#dfe1e5] placeholder-[#868a91] outline-none text-[11px] w-36 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Tabela de Tokens */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse font-sans text-xs">
          <thead className="bg-[#2b2d30] text-[#868a91] sticky top-0 border-b border-[#393b40] select-none text-[11px]">
            <tr>
              <th className="py-1.5 px-3 w-12 font-semibold">#</th>
              <th className="py-1.5 px-3 font-semibold">Token Type</th>
              <th className="py-1.5 px-3 font-semibold">Lexeme</th>
              <th className="py-1.5 px-3 font-semibold">Line</th>
              <th className="py-1.5 px-3 font-semibold">Column</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2b2d30]">
            {pagedTokens.map((tok, idx) => {
              const globalIdx = (safePage - 1) * PAGE_SIZE + idx + 1;
              return (
                <tr key={idx} className="hover:bg-[#2b2d30] transition">
                  <td className="py-1.5 px-3 text-[#6f737a] font-mono text-[11px]">{globalIdx}</td>
                  <td className="py-1.5 px-3">
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold ${
                        tok.type === 'KEYWORD'
                          ? 'bg-[#cf8e6d]/15 text-[#cf8e6d] border border-[#cf8e6d]/30'
                          : tok.type === 'ID'
                          ? 'bg-[#56a8f5]/15 text-[#56a8f5] border border-[#56a8f5]/30'
                          : tok.type === 'INT'
                          ? 'bg-[#2aacb8]/15 text-[#2aacb8] border border-[#2aacb8]/30'
                          : tok.type === 'ERROR'
                          ? 'bg-[#f75464]/15 text-[#f75464] border border-[#f75464]/30'
                          : 'bg-[#2b2d30] text-[#bcbec4] border border-[#393b40]'
                      }`}
                    >
                      {tok.type}
                    </span>
                  </td>
                  <td className="py-1.5 px-3 font-mono font-medium text-[#dfe1e5]">
                    {tok.value === '' && tok.type === 'EOF' ? (
                      <span className="text-[#868a91] italic">&lt;EOF&gt;</span>
                    ) : (
                      tok.value
                    )}
                  </td>
                  <td className="py-1.5 px-3 text-[#868a91] font-mono text-[11px]">{tok.line}</td>
                  <td className="py-1.5 px-3 text-[#868a91] font-mono text-[11px]">{tok.column}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-3 py-1 bg-[#2b2d30] border-t border-[#393b40] text-[11px] text-[#868a91] select-none shrink-0 font-sans">
          <span>
            Showing {(safePage - 1) * PAGE_SIZE + 1} -{' '}
            {Math.min(safePage * PAGE_SIZE, filteredTokens.length)} of {filteredTokens.length} tokens
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={safePage === 1}
              className="p-1 rounded-[4px] bg-[#1e1f22] hover:bg-[#35373c] disabled:opacity-30 transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span>
              Page {safePage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={safePage === totalPages}
              className="p-1 rounded-[4px] bg-[#1e1f22] hover:bg-[#35373c] disabled:opacity-30 transition"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
