import React, { useState } from 'react';
import type { KeyboardEvent } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  X,
  Download,
  BookOpen,
} from 'lucide-react';
import type { EditorFile } from '../hooks/useFiles';
import { EXAMPLES } from '../examples';
import { downloadFile } from '../utils/file-utils';

interface ProjectSidebarProps {
  files: EditorFile[];
  activeFileId: string;
  onSelectFile: (id: string) => void;
  onCreateFile: (customName?: string) => void;
  onCloseFile: (id: string) => void;
  onRenameFile: (id: string, newName: string) => void;
  onSelectExample: (code: string, title?: string) => void;
  onOpenFile: () => void;
  onCollapse: () => void;
}

export function ProjectSidebar({
  files,
  activeFileId,
  onSelectFile,
  onCreateFile,
  onCloseFile,
  onRenameFile,
  onSelectExample,
  onOpenFile,
  onCollapse,
}: ProjectSidebarProps) {
  const [examplesOpen, setExamplesOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleStartRename = (file: EditorFile, e: React.MouseEvent) => {
    e.stopPropagation();
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

  return (
    <aside className="w-60 h-full bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-[var(--ui-radius-lg)] flex flex-col select-none shrink-0 text-xs text-[var(--text-main)] overflow-hidden transition-colors">
      {/* Header limpo do Explorador */}
      <div className="h-9 px-3 flex items-center justify-between border-b border-[var(--border-faint)] shrink-0">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Explorador
        </span>

        <div className="flex items-center gap-0.5 text-[var(--text-muted)]">
          <button
            onClick={() => onCreateFile()}
            title="Novo arquivo MiniLang"
            className="p-1.5 rounded-[var(--ui-radius)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-main)] transition"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onOpenFile}
            title="Abrir arquivo local (Ctrl+O)"
            className="p-1.5 rounded-[var(--ui-radius)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-main)] transition"
          >
            <FolderOpen className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onCollapse}
            title="Recolher Explorador (Alt+1)"
            className="p-1.5 rounded-[var(--ui-radius)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-main)] transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Lista limpa de arquivos do workspace */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        <div className="space-y-0.5">
          <div className="px-2 py-1 flex items-center justify-between text-[10.5px] font-medium text-[var(--text-muted)]">
            <span>Arquivos do Projeto</span>
            <span className="font-mono opacity-75">{files.length}</span>
          </div>

          {files.map((file) => {
            const isActive = file.id === activeFileId;
            const isEditing = file.id === editingId;
            const linesCount = file.content.split('\n').length;

            return (
              <div
                key={file.id}
                onClick={() => onSelectFile(file.id)}
                className={`flex items-center justify-between py-1.5 px-2.5 rounded-[var(--ui-radius)] cursor-pointer transition group ${
                  isActive
                    ? 'bg-[var(--accent-soft)] text-[var(--text-main)] font-medium'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle-soft)]'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 transition ${
                      isActive ? 'bg-[var(--accent-primary)]' : 'bg-[var(--text-faint)]'
                    }`}
                  />

                  {isEditing ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={() => handleFinishRename(file.id)}
                      onKeyDown={(e) => handleKeyDown(e, file.id)}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                      className="bg-[var(--bg-surface)] text-[var(--text-main)] px-1.5 py-0.5 rounded border border-[var(--accent-primary)] text-xs w-full font-mono outline-none"
                    />
                  ) : (
                    <span
                      className="truncate text-xs font-mono"
                      title={`${file.name} (Duplo clique para renomear)`}
                      onDoubleClick={(e) => handleStartRename(file, e)}
                    >
                      {file.name}
                    </span>
                  )}
                </div>

                {/* Contagem de linhas em repouso / ações no hover */}
                {!isEditing && (
                  <div className="flex items-center shrink-0 ml-1">
                    <span className="text-[10px] font-mono text-[var(--text-faint)] group-hover:hidden">
                      {linesCount}L
                    </span>

                    <div className="hidden group-hover:flex items-center gap-0.5">
                      <button
                        onClick={(e) => handleStartRename(file, e)}
                        title="Renomear"
                        className="p-1 rounded hover:bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadFile(file.name, file.content);
                        }}
                        title="Baixar arquivo"
                        className="p-1 rounded hover:bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
                      >
                        <Download className="w-3 h-3" />
                      </button>
                      {files.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onCloseFile(file.id);
                          }}
                          title="Excluir arquivo"
                          className="p-1 rounded hover:bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-rose-400"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Seção colapsável discreta de Exemplos Rápidos */}
        <div className="pt-2 border-t border-[var(--border-faint)]">
          <button
            onClick={() => setExamplesOpen((prev) => !prev)}
            className="w-full flex items-center justify-between py-1 px-2 rounded-[var(--ui-radius)] hover:bg-[var(--bg-subtle-soft)] text-[10.5px] font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] transition"
          >
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3 h-3 opacity-80" />
              <span>Exemplos Rápidos</span>
            </span>
            {examplesOpen ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>

          {examplesOpen && (
            <div className="mt-1 space-y-0.5">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => onSelectExample(ex.code, ex.title)}
                  title={ex.description}
                  className="w-full flex items-center justify-between py-1.5 px-2.5 rounded-[var(--ui-radius)] text-left text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle-soft)] transition"
                >
                  <span className="truncate text-[11.5px]">{ex.title}</span>
                  <span className="text-[9.5px] opacity-65 shrink-0 ml-1.5">
                    {ex.category}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
