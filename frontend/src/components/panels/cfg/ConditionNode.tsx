import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { HelpCircle, CornerDownRight } from 'lucide-react';
import type { CfgNodeData } from './types';

export const ConditionNode = React.memo(function ConditionNode({
  data,
}: {
  data: CfgNodeData;
}) {
  const isActive = data.isActive;

  return (
    <div
      onClick={() => data.onNodeClick?.(data.startLine, data.endLine)}
      className={`min-w-[240px] max-w-[270px] rounded-xl border shadow-lg cursor-pointer transition-all duration-200 select-none overflow-hidden relative ${
        isActive
          ? 'bg-amber-950/60 border-amber-400 ring-2 ring-amber-400/50 scale-105 shadow-amber-500/20'
          : 'bg-amber-950/30 hover:bg-amber-950/50 border-amber-700/60 text-amber-200'
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !bg-amber-400 !border-2 !border-amber-950"
      />

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-amber-950/50 border-b border-amber-800/40 text-[10px]">
        <div className="flex items-center gap-1.5 font-bold text-amber-300">
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>{data.label || 'Desvio Condicional'}</span>
        </div>
        <span className="font-mono px-1.5 py-0.2 rounded bg-black/40 text-amber-300 font-bold">
          L{data.startLine}
        </span>
      </div>

      {/* Expressão Condicional */}
      <div className="p-3 bg-black/30 font-mono text-center">
        <div className="text-[12px] font-bold text-amber-100 tracking-wide break-words">
          {data.condition || data.details || 'se (...) { ... }'}
        </div>
      </div>

      {/* Badges de Saída: Verdadeiro e Falso com Handles separados */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/40 border-t border-amber-900/30 text-[10px]">
        <div className="flex items-center gap-1 text-emerald-400 font-semibold relative">
          <CornerDownRight className="w-3 h-3" />
          <span>Verdadeiro</span>
          <Handle
            id="true"
            type="source"
            position={Position.Bottom}
            className="!left-4 !bottom-[-10px] !w-3 !h-3 !bg-emerald-400 !border-2 !border-emerald-950"
          />
        </div>

        <div className="flex items-center gap-1 text-rose-400 font-semibold relative">
          <span>Falso</span>
          <Handle
            id="false"
            type="source"
            position={Position.Bottom}
            className="!right-4 !bottom-[-10px] !w-3 !h-3 !bg-rose-500 !border-2 !border-rose-950"
          />
        </div>
      </div>
    </div>
  );
});
