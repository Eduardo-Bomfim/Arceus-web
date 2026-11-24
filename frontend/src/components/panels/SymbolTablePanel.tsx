import React, { useState, useMemo } from 'react';
import { Search, Database } from 'lucide-react';
import type { SymbolInfo } from '../../types';

interface SymbolTablePanelProps {
  symbols: SymbolInfo[];
  isLoading?: boolean;
}

export const SymbolTablePanel = React.memo(function SymbolTablePanel({
  symbols,
  isLoading,
}: SymbolTablePanelProps) {
  const [filter, setFilter] = useState('');
  const [scopeFilter, setScopeFilter] = useState<string>('all');

  const uniqueScopes = useMemo(() => {
    const set = new Set(symbols.map((s) => s.scope));
    return Array.from(set);
  }, [symbols]);

  const filteredSymbols = useMemo(() => {
    return symbols.filter((s) => {
      const matchText =
        s.name.toLowerCase().includes(filter.toLowerCase()) ||
        s.type.toLowerCase().includes(filter.toLowerCase());
      const matchScope = scopeFilter === 'all' || s.scope === scopeFilter;
      return matchText && matchScope;
    });
  }, [symbols, filter, scopeFilter]);

  if (isLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8 space-y-3 bg-[var(--bg-surface)]">
        <div className="w-6 h-6 rounded-full border-2 border-[var(--accent-primary)] border-t-transparent animate-spin" />
        <span className="text-xs text-[var(--text-muted)]">Construindo tabela de símbolos...</span>
      </div>
    );
  }

  if (symbols.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-[var(--text-muted)] p-6 text-xs text-center bg-[var(--bg-surface)]">
        Nenhum símbolo declarado no programa atual.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-surface)] text-[var(--text-main)] text-xs overflow-hidden select-text transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 bg-[var(--bg-panel-soft)] border-b border-[var(--border-faint)] select-none shrink-0">
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold text-[var(--text-main)]">
            Tabela de Símbolos ({symbols.length})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {uniqueScopes.length > 1 && (
            <select
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value)}
              className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--ui-radius)] px-2 py-1 text-[var(--text-main)] outline-none text-[11px]"
            >
              <option value="all">Todos os escopos</option>
              {uniqueScopes.map((scope) => (
                <option key={scope} value={scope}>
                  {scope}
                </option>
              ))}
            </select>
          )}

          <div className="relative">
            <Search className="w-3 h-3 absolute left-2.5 top-2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Filtrar nome ou tipo..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--ui-radius)] pl-7 pr-2.5 py-1 text-[var(--text-main)] placeholder-[var(--text-muted)] outline-none text-[11px] w-44 font-mono"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-[var(--bg-panel)] text-[var(--text-muted)] sticky top-0 border-b border-[var(--border-subtle)] select-none text-[11px]">
            <tr>
              <th className="py-2 px-3.5 font-semibold">Identificador</th>
              <th className="py-2 px-3.5 font-semibold">Tipo</th>
              <th className="py-2 px-3.5 font-semibold">Escopo</th>
              <th className="py-2 px-3.5 font-semibold">Posição</th>
              <th className="py-2 px-3.5 font-semibold">Inicializada</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-faint)]">
            {filteredSymbols.map((sym, idx) => (
              <tr key={idx} className="hover:bg-[var(--bg-subtle-soft)] transition">
                <td className="py-2 px-3.5 font-mono font-medium text-[var(--accent-primary)]">
                  {sym.name}
                </td>
                <td className="py-2 px-3.5 font-mono">
                  <span
                    className={`px-1.5 py-0.5 rounded-[var(--ui-radius)] text-[10px] font-semibold ${
                      sym.type === 'INTEIRO'
                        ? 'bg-[var(--accent-soft)] text-[var(--accent-primary)]'
                        : 'bg-purple-500/15 text-purple-400'
                    }`}
                  >
                    {sym.type}
                  </span>
                </td>
                <td className="py-2 px-3.5 text-[var(--text-muted)] font-mono text-[11px]">
                  {sym.scope}
                </td>
                <td className="py-2 px-3.5 text-[var(--text-muted)] font-mono text-[11px]">
                  Ln {sym.line}, Col {sym.column}
                </td>
                <td className="py-2 px-3.5">
                  {sym.initialized ? (
                    <span className="text-[var(--accent-secondary)] font-medium text-[11px]">
                      Sim
                    </span>
                  ) : (
                    <span className="text-amber-400/90 italic text-[11px]">Não</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});
