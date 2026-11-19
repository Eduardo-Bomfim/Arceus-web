import { useState, useMemo } from 'react';
import { Search, Binary } from 'lucide-react';
import type { TokenInfo } from '../../types';

interface TokensPanelProps {
  tokens: TokenInfo[];
}

export function TokensPanel({ tokens }: TokensPanelProps) {
  const [filter, setFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

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

  if (tokens.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-slate-500 italic p-6 text-sm text-center">
        Nenhum token disponível. Execute uma análise ou compilação para visualizar a sequência léxica.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0b0f17] text-slate-300 font-mono text-xs overflow-hidden">
      {/* Barra superior com contador e filtros */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-[#0f1520] border-b border-[#1e293b]">
        <div className="flex items-center gap-2">
          <Binary className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-semibold text-slate-200">
            Tokens do Analisador Léxico ({tokens.length})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {tokenTypes.length > 1 && (
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-[#182232] border border-[#283850] rounded px-2 py-1 text-slate-200 outline-none text-[11px]"
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
              onChange={(e) => setFilter(e.target.value)}
              className="bg-[#182232] border border-[#283850] rounded pl-7 pr-2 py-1 text-slate-200 placeholder-slate-500 outline-none text-[11px] w-40"
            />
          </div>
        </div>
      </div>

      {/* Tabela de tokens */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#121926] text-slate-400 sticky top-0 border-b border-[#1e293b] select-none text-[11px]">
            <tr>
              <th className="py-2 px-3 w-12">#</th>
              <th className="py-2 px-3">Tipo de Token</th>
              <th className="py-2 px-3">Lexema (Valor)</th>
              <th className="py-2 px-3">Linha</th>
              <th className="py-2 px-3">Coluna</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e293b]">
            {filteredTokens.map((tok, idx) => (
              <tr key={idx} className="hover:bg-[#131d2e] transition">
                <td className="py-2 px-3 text-slate-600">{idx + 1}</td>
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
