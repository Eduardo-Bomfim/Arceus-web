import { useState, useMemo } from 'react';
import { Search, Database } from 'lucide-react';
import type { SymbolInfo } from '../../types';

interface SymbolTablePanelProps {
  symbols: SymbolInfo[];
}

export function SymbolTablePanel({ symbols }: SymbolTablePanelProps) {
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

  if (symbols.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-slate-500 italic p-6 text-sm text-center">
        Nenhum símbolo declarado ou análise não executada. Clique em "Analisar" ou execute o programa.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0b0f17] text-slate-300 font-mono text-xs overflow-hidden">
      {/* Barra de filtros */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-[#0f1520] border-b border-[#1e293b]">
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-semibold text-slate-200">
            Tabela de Símbolos ({symbols.length})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Filtro por escopo */}
          {uniqueScopes.length > 1 && (
            <select
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value)}
              className="bg-[#182232] border border-[#283850] rounded px-2 py-1 text-slate-200 outline-none text-[11px]"
            >
              <option value="all">Todos os Escopos</option>
              {uniqueScopes.map((scope) => (
                <option key={scope} value={scope}>
                  {scope}
                </option>
              ))}
            </select>
          )}

          {/* Busca por texto */}
          <div className="relative">
            <Search className="w-3 h-3 absolute left-2 top-2 text-slate-500" />
            <input
              type="text"
              placeholder="Filtrar por nome/tipo..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-[#182232] border border-[#283850] rounded pl-7 pr-2 py-1 text-slate-200 placeholder-slate-500 outline-none text-[11px] w-44"
            />
          </div>
        </div>
      </div>

      {/* Tabela de símbolos */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#121926] text-slate-400 sticky top-0 border-b border-[#1e293b] select-none text-[11px]">
            <tr>
              <th className="py-2 px-3">Nome</th>
              <th className="py-2 px-3">Tipo</th>
              <th className="py-2 px-3">Escopo</th>
              <th className="py-2 px-3">Posição</th>
              <th className="py-2 px-3">Inicializada?</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e293b]">
            {filteredSymbols.map((sym, idx) => (
              <tr key={idx} className="hover:bg-[#131d2e] transition">
                <td className="py-2 px-3 font-semibold text-sky-300">{sym.name}</td>
                <td className="py-2 px-3">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      sym.type === 'INTEIRO'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/40'
                        : 'bg-purple-950 text-purple-300 border border-purple-800/40'
                    }`}
                  >
                    {sym.type}
                  </span>
                </td>
                <td className="py-2 px-3 text-slate-400">{sym.scope}</td>
                <td className="py-2 px-3 text-slate-500">
                  L{sym.line} : C{sym.column}
                </td>
                <td className="py-2 px-3">
                  {sym.initialized ? (
                    <span className="text-emerald-400 font-semibold text-[11px]">
                      Sim
                    </span>
                  ) : (
                    <span className="text-amber-400/80 italic text-[11px]">
                      Não
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
