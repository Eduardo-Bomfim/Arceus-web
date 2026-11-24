import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Plus, X, Copy, Check, Sparkles, Download } from 'lucide-react';
import type { EditorFile } from '../hooks/useFiles';
import { Breadcrumbs } from './Breadcrumbs';
import { useTheme } from '../context/ThemeContext';

interface EditorTabsProps {
  files: EditorFile[];
  activeFileId: string;
  onSelectFile: (id: string) => void;
  onCreateFile: () => void;
  onCloseFile: (id: string) => void;
  onRenameFile: (id: string, newName: string) => void;
  onCopyCode?: () => void;
  onFormatCode?: () => void;
  onDownloadFile?: () => void;
  cursorLine?: number;
  onNavigateToLine?: (line: number) => void;
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
  onDownloadFile,
  cursorLine = 1,
  onNavigateToLine,
}: EditorTabsProps) {
  const { settings } = useTheme();
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
      setTimeout(() => setCopied(false), 1800);
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
    <div className="flex flex-col select-none shrink-0 bg-[var(--bg-panel)] transition-colors">
      {/* Barra de Abas Minimalista */}
      <div
        style={{ height: 'var(--ui-tab-h)' }}
        className="flex items-center justify-between px-2 border-b border-[var(--border-subtle)] overflow-x-auto no-scrollbar"
      >
        <div className="flex items-center gap-1 h-full overflow-x-auto no-scrollbar py-1">
          {files.map((file) => {
            const isActive = file.id === activeFileId;
            const isEditing = file.id === editingId;

            return (
              <div
                key={file.id}
                onClick={() => onSelectFile(file.id)}
                onDoubleClick={() => handleStartRename(file)}
                className={`group flex items-center gap-2 h-full px-2.5 cursor-pointer text-xs transition select-none shrink-0 rounded-[var(--ui-radius)] ${
                  isActive
                    ? 'bg-[var(--bg-surface)] text-[var(--text-main)] font-medium shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle-soft)]'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    isActive ? 'bg-[var(--accent-primary)]' : 'bg-transparent'
                  }`}
                />

                {isEditing ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => handleFinishRename(file.id)}
                    onKeyDown={(e) => handleKeyDown(e, file.id)}
                    className="bg-[var(--bg-app)] text-[var(--text-main)] px-1.5 py-0.5 rounded text-xs outline-none border border-[var(--accent-primary)] w-28 font-mono"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="truncate max-w-[160px] font-mono text-[11.5px]">
                    {file.name}
                  </span>
                )}

                {files.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseFile(file.id);
                    }}
                    title="Fechar aba"
                    className={`p-0.5 rounded hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition ${
                      isActive ? 'opacity-65 hover:opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          <button
            onClick={onCreateFile}
            title="Novo arquivo (.ml)"
            className="w-6 h-6 ml-0.5 rounded-[var(--ui-radius)] hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition flex items-center justify-center shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Ações sutis do editor à direita */}
        <div className="flex items-center gap-0.5 pl-2 shrink-0 text-[var(--text-muted)]">
          {onFormatCode && (
            <button
              onClick={handleFormat}
              title="Formatar código (Shift+Alt+F)"
              className="flex items-center gap-1.5 px-2 py-1 rounded-[var(--ui-radius)] text-[11px] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-main)] transition"
            >
              <Sparkles className="w-3 h-3 text-[var(--accent-primary)]" />
              <span className="hidden sm:inline">
                {formatted ? 'Formatado' : 'Formatar'}
              </span>
            </button>
          )}

          {onCopyCode && (
            <button
              onClick={handleCopy}
              title="Copiar código"
              className="p-1.5 rounded-[var(--ui-radius)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-main)] transition"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-[var(--accent-secondary)]" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          )}

          {onDownloadFile && (
            <button
              onClick={onDownloadFile}
              title="Baixar arquivo (.ml)"
              className="p-1.5 rounded-[var(--ui-radius)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-main)] transition"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Breadcrumbs opcionais (desativados por padrão para menor poluição visual) */}
      {settings.showBreadcrumbs && (
        <Breadcrumbs
          fileName={activeFile?.name || 'programa.ml'}
          sourceCode={activeFile?.content || ''}
          cursorLine={cursorLine}
          onNavigateToLine={onNavigateToLine}
        />
      )}
    </div>
  );
}
