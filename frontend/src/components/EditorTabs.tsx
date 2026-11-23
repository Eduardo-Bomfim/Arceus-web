import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import {
  Plus,
  X,
  Copy,
  Check,
  Map,
  PanelBottom,
  PanelRight,
  Sparkles,
} from 'lucide-react';
import type { EditorFile } from '../hooks/useFiles';
import { Breadcrumbs } from './Breadcrumbs';

interface EditorTabsProps {
  files: EditorFile[];
  activeFileId: string;
  onSelectFile: (id: string) => void;
  onCreateFile: () => void;
  onCloseFile: (id: string) => void;
  onRenameFile: (id: string, newName: string) => void;
  onCopyCode?: () => void;
  onFormatCode?: () => void;
  showMinimap?: boolean;
  onToggleMinimap?: () => void;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  panelPosition?: 'bottom' | 'right';
  onTogglePanelPosition?: () => void;
  cursorLine?: number;
  onNavigateToLine?: (line: number) => void;
}

// Ícone oficial de arquivo MiniLang estilo JetBrains
function JetBrainsMlTabIcon({ isActive }: { isActive: boolean }) {
  return (
    <div
      className={`w-3.5 h-3.5 rounded-[2px] flex items-center justify-center shrink-0 ${
        isActive
          ? 'bg-[var(--accent-primary)]/25 text-[var(--accent-primary)] border border-[var(--accent-primary)]/50'
          : 'bg-[var(--accent-primary)]/10 text-[var(--text-muted)] border border-transparent'
      }`}
    >
      <span className="text-[8px] font-black font-mono leading-none">M</span>
    </div>
  );
}

export function EditorTabs({
  files,
  activeFileId,
  onSelectFile,
  onCreateFile,
  onCloseFile,
  onRenameFile,
  onCopyCode,
  onFormatCode,
  showMinimap = true,
  onToggleMinimap,
  panelPosition = 'bottom',
  onTogglePanelPosition,
  cursorLine = 1,
  onNavigateToLine,
}: EditorTabsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [copied, setCopied] = useState(false);
  const [formatted, setFormatted] = useState(false);

  const activeFile = files.find((f) => f.id === activeFileId) || files[0];

  const handleStartRename = (file: EditorFile) => {
    setEditingId(file.id);
    setEditName(file.name);
  };

  const handleFinishRename = (id: string) => {
    if (editName.trim()) {
      onRenameFile(id, editName.trim());
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, id: string) => {
    if (e.key === 'Enter') {
      handleFinishRename(id);
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  const handleCopy = () => {
    if (onCopyCode) {
      onCopyCode();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFormat = () => {
    if (onFormatCode) {
      onFormatCode();
      setFormatted(true);
      setTimeout(() => setFormatted(false), 1500);
    }
  };

  return (
    <div className="flex flex-col select-none shrink-0 bg-[var(--bg-header)] border-b border-[var(--border-color)] transition-colors">
      {/* 1. Barra de Abas do Editor - Estilo JetBrains New UI */}
      <div className="flex items-center justify-between h-[34px] px-1 bg-[var(--bg-header)] overflow-x-auto no-scrollbar">
        {/* Abas e Botão Nova Aba */}
        <div className="flex items-center h-full overflow-x-auto no-scrollbar">
          {files.map((file) => {
            const isActive = file.id === activeFileId;
            const isEditing = file.id === editingId;

            return (
              <div
                key={file.id}
                onClick={() => onSelectFile(file.id)}
                onDoubleClick={() => handleStartRename(file)}
                className={`group flex items-center gap-2 h-full px-3 cursor-pointer text-xs transition select-none shrink-0 border-r border-[var(--border-color)]/60 relative ${
                  isActive
                    ? 'bg-[var(--bg-surface)] text-[var(--text-main)] font-semibold border-b-2 border-b-[var(--accent-primary)]'
                    : 'bg-[var(--bg-header)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]'
                }`}
              >
                <JetBrainsMlTabIcon isActive={isActive} />

                {isEditing ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => handleFinishRename(file.id)}
                    onKeyDown={(e) => handleKeyDown(e, file.id)}
                    className="bg-[var(--bg-panel)] text-[var(--text-main)] px-1 py-0.5 rounded text-xs outline-none border border-[var(--accent-primary)] w-24 font-mono"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="truncate max-w-[140px] font-mono text-[11.5px]">{file.name}</span>
                )}

                {/* Botão Fechar Aba (estilo JetBrains) */}
                {files.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseFile(file.id);
                    }}
                    title="Close Tab (Ctrl+F4)"
                    className={`p-0.5 rounded-[3px] hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition ${
                      isActive ? 'opacity-70 hover:opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          {/* Botão Nova Aba */}
          <button
            onClick={onCreateFile}
            title="New File"
            className="w-7 h-7 ml-1 rounded-[4px] hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition flex items-center justify-center shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Controles da Direita: Reformat, Layout Split, Minimap, Copy */}
        <div className="flex items-center gap-1 px-1.5 shrink-0 text-[var(--text-muted)]">
          {/* Botão Formatar Código (Ctrl+Alt+L no JetBrains) */}
          {onFormatCode && (
            <button
              onClick={handleFormat}
              title="Reformat Code (Shift+Alt+F ou Ctrl+Alt+L)"
              className="flex items-center gap-1 px-2 py-1 rounded-[4px] text-[11px] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-main)] transition"
            >
              <Sparkles className="w-3 h-3 text-[var(--accent-primary)]" />
              <span className="hidden sm:inline font-sans">
                {formatted ? 'Reformatted' : 'Reformat'}
              </span>
            </button>
          )}

          {/* Alternar Posição do Split (Abaixo vs Direita) */}
          {onTogglePanelPosition && (
            <button
              onClick={onTogglePanelPosition}
              title={
                panelPosition === 'bottom'
                  ? 'Move Tool Window to Right'
                  : 'Move Tool Window to Bottom'
              }
              className="p-1.5 rounded-[4px] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-main)] transition flex items-center gap-1"
            >
              {panelPosition === 'bottom' ? (
                <PanelRight className="w-3.5 h-3.5" />
              ) : (
                <PanelBottom className="w-3.5 h-3.5" />
              )}
            </button>
          )}

          {/* Toggle do Minimap */}
          {onToggleMinimap && (
            <button
              onClick={onToggleMinimap}
              title={showMinimap ? 'Hide Minimap' : 'Show Minimap'}
              className={`p-1.5 rounded-[4px] transition ${
                showMinimap
                  ? 'text-[var(--text-main)] bg-[var(--bg-subtle)]'
                  : 'hover:bg-[var(--bg-subtle)] hover:text-[var(--text-main)]'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Copiar Código */}
          {onCopyCode && (
            <button
              onClick={handleCopy}
              title="Copy Code to Clipboard"
              className="p-1.5 rounded-[4px] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-main)] transition"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* 2. JetBrains Navigation Bar (Breadcrumbs) */}
      <Breadcrumbs
        fileName={activeFile?.name || 'main.ml'}
        sourceCode={activeFile?.content || ''}
        cursorLine={cursorLine}
        onNavigateToLine={onNavigateToLine}
      />
    </div>
  );
}
