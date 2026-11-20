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
      <div className="flex flex-col h-full items-center justify-center p-8 space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
        <span className="text-xs text-slate-400">Escaneando tokens léxicos...</span>
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-slate-500 italic p-6 text-xs text-center">
        Nenhum token disponível. Execute uma análise ou compilação para visualizar a sequência léxica.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-panel)] text-[var(--text-main)] font-mono text-xs overflow-hidden select-text">
      {/* Barra superior com contador e filtros */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-[var(--bg-header)] border-b border-[var(--border-color)] select-none">
        <div className="flex items-center gap-2">
          <Binary className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold text-slate-200">
            Tokens do Analisador Léxico ({tokens.length})
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
              className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded px-2 py-1 text-slate-200 outline-none text-[11px]"
            >
              <option value="all">Todos os Tipos</option>
              {tokenTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          )}

          <div className="relative">
            <Search className="w-3 h-3 absolute left-2 top-2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar lexema..."
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded pl-7 pr-2 py-1 text-slate-200 placeholder-slate-500 outline-none text-[11px] w-36"
            />
          </div>
        </div>
      </div>

      {/* Tabela de tokens */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[var(--bg-surface)] text-slate-400 sticky top-0 border-b border-[var(--border-color)] select-none text-[11px]">
            <tr>
              <th className="py-2 px-3 w-12">#</th>
              <th className="py-2 px-3">Tipo de Token</th>
              <th className="py-2 px-3">Lexema (Valor)</th>
              <th className="py-2 px-3">Linha</th>
              <th className="py-2 px-3">Coluna</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {pagedTokens.map((tok, idx) => {
              const globalIdx = (safePage - 1) * PAGE_SIZE + idx + 1;
              return (
                <tr key={idx} className="hover:bg-[var(--bg-surface)] transition">
                  <td className="py-2 px-3 text-slate-600">{globalIdx}</td>
                  <td className="py-2 px-3">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        tok.type === 'KEYWORD'
                          ? 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
                          : tok.type === 'ID'
                          ? 'bg-sky-950/60 text-sky-300 border border-sky-800/40'
                          : tok.type === 'INT'
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                          : tok.type === 'ERROR'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800/40'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {tok.type}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-semibold text-slate-200">
                    {tok.value === '' && tok.type === 'EOF' ? (
                      <span className="text-slate-500 italic">&lt;EOF&gt;</span>
                    ) : (
                      tok.value
                    )}
                  </td>
                  <td className="py-2 px-3 text-slate-400">{tok.line}</td>
                  <td className="py-2 px-3 text-slate-400">{tok.column}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Paginação (#13: Virtualização / Paginação Fluida) */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-[var(--bg-header)] border-t border-[var(--border-color)] text-[11px] text-[var(--text-muted)] select-none">
          <span>
            Mostrando {(safePage - 1) * PAGE_SIZE + 1} -{' '}
            {Math.min(safePage * PAGE_SIZE, filteredTokens.length)} de {filteredTokens.length} tokens
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={safePage === 1}
              className="p-1 rounded bg-[var(--bg-surface)] hover:bg-[var(--bg-panel)] disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span>
              Página {safePage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={safePage === totalPages}
              className="p-1 rounded bg-[var(--bg-surface)] hover:bg-[var(--bg-panel)] disabled:opacity-40 transition"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
