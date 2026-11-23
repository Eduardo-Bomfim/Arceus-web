import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { CheckCircle2 } from 'lucide-react';
import type { CfgNodeData } from './types';

export const EndNode = React.memo(function EndNode({
  data,
}: {
  data: CfgNodeData;
}) {
  const isActive = data.isActive;

  return (
    <div
      onClick={() => data.onNodeClick?.(data.startLine, data.endLine)}
      className={`px-4 py-2.5 rounded-full border shadow-md flex items-center gap-2 cursor-pointer transition-all duration-200 select-none ${
        isActive
          ? 'bg-slate-900 border-sky-400 ring-2 ring-sky-400/50 scale-105 shadow-sky-500/20'
          : 'bg-slate-900/80 hover:bg-slate-800 border-slate-700 text-slate-300'
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-slate-400 !border-2 !border-slate-950"
      />

      <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
        <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
      </div>
      <div className="flex flex-col">
        <span className="font-bold text-xs tracking-wide text-slate-200">
          {data.label || 'Fim do Programa'}
        </span>
        <span className="text-[9px] text-slate-500 font-mono">
          L{data.startLine}
        </span>
      </div>
    </div>
  );
});
