import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Repeat, ArrowUpRight } from 'lucide-react';
import type { CfgNodeData } from './types';

export const LoopNode = React.memo(function LoopNode({
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
          ? 'bg-indigo-950/70 border-indigo-400 ring-2 ring-indigo-400/50 scale-105 shadow-indigo-500/20'
          : 'bg-indigo-950/30 hover:bg-indigo-950/50 border-indigo-700/60 text-indigo-200'
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !bg-indigo-400 !border-2 !border-indigo-950"
      />

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-indigo-950/50 border-b border-indigo-800/40 text-[10px]">
        <div className="flex items-center gap-1.5 font-bold text-indigo-300">
          <Repeat className="w-3.5 h-3.5 text-indigo-400" />
          <span>{data.label || 'Laço de Repetição'}</span>
        </div>
        <span className="font-mono px-1.5 py-0.2 rounded bg-black/40 text-indigo-300 font-bold">
          L{data.startLine}
        </span>
      </div>

      {/* Condição do Laço */}
      <div className="p-3 bg-black/30 font-mono text-center">
        <div className="text-[12px] font-bold text-indigo-100 tracking-wide break-words">
          {data.condition || data.details || 'enquanto (...) { ... }'}
        </div>
      </div>

      {/* Saídas */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/40 border-t border-indigo-900/30 text-[10px]">
        <div className="flex items-center gap-1 text-sky-400 font-semibold relative">
          <Repeat className="w-3 h-3" />
          <span>Itera (Corpo)</span>
          <Handle
            id="body"
            type="source"
            position={Position.Bottom}
            className="!left-4 !bottom-[-10px] !w-3 !h-3 !bg-sky-400 !border-2 !border-indigo-950"
          />
        </div>

        <div className="flex items-center gap-1 text-slate-400 font-semibold relative">
          <span>Sai do Laço</span>
          <ArrowUpRight className="w-3 h-3" />
          <Handle
            id="exit"
            type="source"
            position={Position.Bottom}
            className="!right-4 !bottom-[-10px] !w-3 !h-3 !bg-slate-400 !border-2 !border-indigo-950"
          />
        </div>
      </div>
    </div>
  );
});
