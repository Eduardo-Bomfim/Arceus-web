import { useState } from 'react';
import { GitCompare, Copy, Check } from 'lucide-react';

interface AstPanelProps {
  rawAst: string | null;
  optimizedAst: string | null;
  optimizeEnabled: boolean;
}

export function AstPanel({
  rawAst,
  optimizedAst,
  optimizeEnabled,
}: AstPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!rawAst) {
    return (
      <div className="flex h-full items-center justify-center text-slate-500 italic p-6 text-sm text-center">
        Execute uma análise estática (botão Analisar ou F9) para visualizar a Árvore Sintática Abstrata (AST).
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0b0f17] text-slate-300 font-mono text-xs overflow-hidden">
      {/* Header com indicador */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#0f1520] border-b border-[#1e293b]">
        <div className="flex items-center gap-2 text-slate-400">
          <GitCompare className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-semibold text-slate-200">
            {optimizeEnabled ? 'Comparação AST: Original vs. Otimizada (Constant Folding)' : 'Árvore Sintática Abstrata (AST)'}
          </span>
        </div>

        <button
          onClick={() => handleCopy(optimizedAst || rawAst)}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-[#1a2333] hover:bg-[#243247] text-slate-300 transition"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copiado!' : 'Copiar AST'}
        </button>
      </div>

      {/* Conteúdo: Split View se --opt estiver ativo, ou visualização única */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#1e293b] overflow-hidden">
        {/* Coluna 1: AST Bruta */}
        <div className="flex flex-col h-full overflow-hidden">
          <div className="px-3 py-1.5 bg-[#131b27] border-b border-[#1e293b] text-sky-400 font-semibold text-[11px]">
            AST Original (Pós-Semântica com Tipos)
          </div>
          <div className="flex-1 p-3 overflow-auto whitespace-pre leading-relaxed select-text font-mono">
            {rawAst}
          </div>
        </div>

        {/* Coluna 2: AST Otimizada */}
        <div className="flex flex-col h-full overflow-hidden">
          <div className="px-3 py-1.5 bg-[#131b27] border-b border-[#1e293b] text-emerald-400 font-semibold text-[11px] flex items-center justify-between">
            <span>AST Otimizada (Constant Folding)</span>
            {!optimizeEnabled && (
              <span className="text-slate-500 font-normal italic">Ative --opt na barra superior</span>
            )}
          </div>
          <div className="flex-1 p-3 overflow-auto whitespace-pre leading-relaxed select-text font-mono">
            {optimizedAst || (
              <span className="text-slate-500 italic">
                Ative o toggle "Constant Folding (--opt)" na barra superior e clique em Analisar para visualizar as expressões dobradas.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
