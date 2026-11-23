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
      <div className="flex flex-col h-full items-center justify-center p-8 space-y-3 bg-[#1e1f22]">
        <div className="w-6 h-6 rounded-full border-2 border-[#3574f0] border-t-transparent animate-spin" />
        <span className="text-xs text-[#868a91]">Building Symbol Table...</span>
      </div>
    );
  }

  if (symbols.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-[#868a91] p-6 text-xs text-center font-sans bg-[#1e1f22]">
        No declared symbols. Run inspection or execute the program to populate symbol table.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#1e1f22] text-[#dfe1e5] font-sans text-xs overflow-hidden select-text">
      {/* Header com Filtros */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 bg-[#2b2d30] border-b border-[#393b40] select-none shrink-0">
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-[#3574f0]" />
          <span className="font-semibold text-[#dfe1e5]">
            Symbol Table ({symbols.length})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Filtro por escopo */}
          {uniqueScopes.length > 1 && (
            <select
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value)}
              className="bg-[#1e1f22] border border-[#393b40] rounded-[4px] px-2 py-0.5 text-[#dfe1e5] outline-none text-[11px]"
            >
              <option value="all">All Scopes</option>
              {uniqueScopes.map((scope) => (
                <option key={scope} value={scope}>
                  {scope}
                </option>
              ))}
            </select>
          )}

          {/* Busca por texto */}
          <div className="relative">
            <Search className="w-3 h-3 absolute left-2 top-1.5 text-[#868a91]" />
            <input
              type="text"
              placeholder="Filter by name / type..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-[#1e1f22] border border-[#393b40] rounded-[4px] pl-6 pr-2 py-0.5 text-[#dfe1e5] placeholder-[#868a91] outline-none text-[11px] w-40 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Tabela de Símbolos JetBrains */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse font-sans text-xs">
          <thead className="bg-[#2b2d30] text-[#868a91] sticky top-0 border-b border-[#393b40] select-none text-[11px]">
            <tr>
              <th className="py-1.5 px-3 font-semibold">Identifier</th>
              <th className="py-1.5 px-3 font-semibold">Type</th>
              <th className="py-1.5 px-3 font-semibold">Scope</th>
              <th className="py-1.5 px-3 font-semibold">Location</th>
              <th className="py-1.5 px-3 font-semibold">Initialized</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2b2d30]">
            {filteredSymbols.map((sym, idx) => (
              <tr key={idx} className="hover:bg-[#2b2d30] transition">
                <td className="py-1.5 px-3 font-mono font-medium text-[#56a8f5]">{sym.name}</td>
                <td className="py-1.5 px-3 font-mono">
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                      sym.type === 'INTEIRO'
                        ? 'bg-[#3574f0]/20 text-[#56a8f5] border border-[#3574f0]/40'
                        : 'bg-[#a855f7]/20 text-[#c084fc] border border-[#a855f7]/40'
                    }`}
                  >
                    {sym.type}
                  </span>
                </td>
                <td className="py-1.5 px-3 text-[#868a91] font-mono text-[11px]">{sym.scope}</td>
                <td className="py-1.5 px-3 text-[#868a91] font-mono text-[11px]">
                  Ln {sym.line}, Col {sym.column}
                </td>
                <td className="py-1.5 px-3">
                  {sym.initialized ? (
                    <span className="text-[#59a869] font-medium text-[11px]">Yes</span>
                  ) : (
                    <span className="text-[#e5a83b] italic text-[11px]">No</span>
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
