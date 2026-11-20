import React, { useMemo } from 'react';
import { Network, Play, CheckCircle, ArrowDown, HelpCircle, Repeat, CornerDownRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface CfgPanelProps {
  sourceCode: string;
  astRaw: string | null;
  isLoading?: boolean;
}

interface CfgNode {
  id: string;
  type: 'start' | 'decl' | 'stmt' | 'condition' | 'loop' | 'end';
  label: string;
  details?: string;
  trueBranch?: string;
  falseBranch?: string;
  loopBack?: boolean;
}

/**
 * Constrói o Grafo de Fluxo de Controle (CFG) a partir da análise da AST e código fonte.
 */
function buildControlFlowGraph(source: string, ast: string | null): CfgNode[] {
  if (!ast || !source) return [];

  const nodes: CfgNode[] = [];

  // 1. Nó de Início
  nodes.push({
    id: 'node_start',
    type: 'start',
    label: 'Início do Programa',
    details: 'Ponto de entrada da execução MiniLang',
  });

  // Extrai declarações e comandos principais do código
  const lines = source.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));

  let currentBlock: string[] = [];

  const flushCurrentBlock = () => {
    if (currentBlock.length > 0) {
      nodes.push({
        id: `node_block_${nodes.length}`,
        type: 'stmt',
        label: 'Bloco de Instruções Lineares',
        details: currentBlock.join('\n'),
      });
      currentBlock = [];
    }
  };

  for (const line of lines) {
    if (line.startsWith('programa ') || line === '{' || line === '}' || line.startsWith('fim.')) {
      continue;
    }

    if (line.startsWith('var ')) {
      currentBlock.push(line);
    } else if (line.startsWith('se ') || line.startsWith('se(')) {
      flushCurrentBlock();
      nodes.push({
        id: `node_cond_${nodes.length}`,
        type: 'condition',
        label: 'Desvio Condicional (se)',
        details: line.replace(/\{.*/, '').trim(),
      });
    } else if (line.startsWith('senão') || line.startsWith('senao')) {
      flushCurrentBlock();
      nodes.push({
        id: `node_else_${nodes.length}`,
        type: 'condition',
        label: 'Ramo Falso (senão)',
        details: 'Executado quando a condição for falsa',
      });
    } else if (line.startsWith('enquanto ') || line.startsWith('enquanto(')) {
      flushCurrentBlock();
      nodes.push({
        id: `node_while_${nodes.length}`,
        type: 'loop',
        label: "Laço Pré-testado (enquanto)",
        details: line.replace(/\{.*/, '').trim(),
        loopBack: true,
      });
    } else if (line.startsWith('para ')) {
      flushCurrentBlock();
      nodes.push({
        id: `node_for_${nodes.length}`,
        type: 'loop',
        label: "Laço Contado (para ... ate ... passo)",
        details: line.replace(/\{.*/, '').trim(),
        loopBack: true,
      });
    } else if (line.startsWith('repita')) {
      flushCurrentBlock();
      nodes.push({
        id: `node_repeat_${nodes.length}`,
        type: 'loop',
        label: "Início do Laço Pós-testado (repita)",
        details: 'Executa o corpo antes de testar a condição',
      });
    } else if (line.startsWith('ate ') || line.startsWith('ate(')) {
      flushCurrentBlock();
      nodes.push({
        id: `node_ate_${nodes.length}`,
        type: 'loop',
        label: "Condição de Parada (ate)",
        details: line.trim(),
        loopBack: true,
      });
    } else {
      currentBlock.push(line);
    }
  }

  flushCurrentBlock();

  // Nó Final
  nodes.push({
    id: 'node_end',
    type: 'end',
    label: 'Fim do Programa',
    details: 'Encerramento com código de saída 0',
  });

  return nodes;
}

export const CfgPanel = React.memo(function CfgPanel({
  sourceCode,
  astRaw,
  isLoading,
}: CfgPanelProps) {
  const { themeConfig } = useTheme();

  const cfgNodes = useMemo(() => {
    return buildControlFlowGraph(sourceCode, astRaw);
  }, [sourceCode, astRaw]);

  if (isLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8 space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
        <span className="text-xs text-slate-400">Gerando Grafo de Fluxo de Controle...</span>
      </div>
    );
  }

  if (cfgNodes.length <= 2) {
    return (
      <div className="flex h-full items-center justify-center text-slate-500 italic p-6 text-xs text-center">
        Escreva ou carregue um programa e execute a análise (F9) para visualizar o Grafo de Fluxo de Controle (CFG).
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-panel)] text-[var(--text-main)] font-mono text-xs overflow-hidden select-text">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[var(--bg-header)] border-b border-[var(--border-color)] select-none">
        <div className="flex items-center gap-2">
          <Network className="w-3.5 h-3.5" style={{ color: themeConfig.primaryColor }} />
          <span className="font-semibold text-slate-200">
            Grafo de Fluxo de Controle (CFG Didático)
          </span>
        </div>
        <span className="text-[11px] text-[var(--text-muted)]">
          {cfgNodes.length} nós de controle identificados
        </span>
      </div>

      {/* Diagrama de Nós do Fluxo */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {cfgNodes.map((node, index) => {
          const isStart = node.type === 'start';
          const isEnd = node.type === 'end';
          const isCondition = node.type === 'condition';
          const isLoop = node.type === 'loop';

          return (
            <div key={node.id} className="flex flex-col items-center">
              {/* Card do Nó */}
              <div
                className={`w-full max-w-md p-3 rounded-lg border transition shadow-sm ${
                  isStart
                    ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-300'
                    : isEnd
                    ? 'bg-slate-900 border-slate-700 text-slate-300'
                    : isCondition
                    ? 'bg-amber-950/30 border-amber-600/50 text-amber-200'
                    : isLoop
                    ? 'bg-indigo-950/30 border-indigo-600/50 text-indigo-200'
                    : 'bg-[var(--bg-surface)] border-[var(--border-color)] text-[var(--text-main)]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    {isStart && <Play className="w-3 h-3 fill-emerald-400 text-emerald-400" />}
                    {isEnd && <CheckCircle className="w-3 h-3 text-slate-400" />}
                    {isCondition && <HelpCircle className="w-3 h-3 text-amber-400" />}
                    {isLoop && <Repeat className="w-3 h-3 text-indigo-400" />}
                    <span>{node.label}</span>
                  </div>

                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-black/30 text-[var(--text-muted)] font-mono">
                    Nó #{index + 1}
                  </span>
                </div>

                {node.details && (
                  <pre className="text-[11px] opacity-90 whitespace-pre-wrap font-mono leading-relaxed bg-black/25 p-2 rounded mt-1 overflow-x-auto">
                    {node.details}
                  </pre>
                )}

                {/* Badges de bifurcação se for condicional ou laço */}
                {isCondition && (
                  <div className="flex items-center gap-2 mt-2 pt-1 border-t border-amber-900/40 text-[10px]">
                    <span className="flex items-center gap-0.5 text-emerald-400 font-semibold">
                      <CornerDownRight className="w-3 h-3" /> Verdadeiro: executa bloco
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-rose-400 font-semibold">Falso: desvia fluxo</span>
                  </div>
                )}

                {isLoop && (
                  <div className="flex items-center gap-2 mt-2 pt-1 border-t border-indigo-900/40 text-[10px]">
                    <span className="flex items-center gap-0.5 text-sky-400 font-semibold">
                      <Repeat className="w-3 h-3" /> Itera enquanto verdadeiro
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">Sai ao término</span>
                  </div>
                )}
              </div>

              {/* Seta de Conexão com o próximo nó */}
              {index < cfgNodes.length - 1 && (
                <div className="flex flex-col items-center my-1 text-[var(--border-color)]">
                  <div className="w-0.5 h-3 bg-current" />
                  <ArrowDown className="w-3.5 h-3.5 -mt-1 text-slate-500" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});
