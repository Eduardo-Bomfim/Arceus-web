import React, { useState } from 'react';
import type { KeyboardEvent } from 'react';
import {
  Folder,
  FolderOpen as FolderOpenIcon,
  Plus,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronRight,
  Library,
  Minus,
  Sparkles,
} from 'lucide-react';
import type { EditorFile } from '../hooks/useFiles';
import { EXAMPLES } from '../examples';

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

// Ícone oficial de arquivo MiniLang estilo JetBrains
function JetBrainsMlFileIcon() {
  return (
    <div className="w-3.5 h-3.5 rounded-[2px] bg-[var(--accent-primary)]/20 border border-[var(--accent-primary)]/40 flex items-center justify-center shrink-0">
      <span className="text-[8px] font-black font-mono text-[var(--accent-primary)] leading-none">M</span>
    </div>
  );
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
  const [srcFolderOpen, setSrcFolderOpen] = useState(true);
  const [librariesOpen, setLibrariesOpen] = useState(false);
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
    <aside className="w-64 h-full bg-[var(--bg-panel)] border-r border-[var(--border-color)] flex flex-col select-none shrink-0 font-sans text-xs text-[var(--text-main)] transition-colors">
      {/* 1. Header do Painel Project (Estilo JetBrains Tool Window Header) */}
      <div className="h-7 px-2.5 bg-[var(--bg-header)] border-b border-[var(--border-color)] flex items-center justify-between text-[var(--text-main)]">
        {/* Project View Dropdown */}
        <div className="flex items-center gap-1.5 cursor-pointer hover:text-white transition">
          <span className="font-semibold text-xs text-[var(--text-main)]">Project</span>
          <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />
        </div>

        {/* Ações da Tool Window (Novo arquivo, Abrir, Recolher) */}
        <div className="flex items-center gap-0.5 text-[var(--text-muted)]">
          <button
            onClick={() => onCreateFile()}
            title="New MiniLang File"
            className="p-1 rounded-[4px] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-main)] transition"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onOpenFile}
            title="Open File..."
            className="p-1 rounded-[4px] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-main)] transition"
          >
            <FolderOpenIcon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onCollapse}
            title="Hide Project Tool Window (Alt+1)"
            className="p-1 rounded-[4px] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-main)] transition"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Árvore de Arquivos (JetBrains Project Tree) */}
      <div className="flex-1 overflow-y-auto py-1 text-xs">
        {/* Raiz do Projeto: arceus-web */}
        <div className="px-1.5">
          <div className="flex items-center gap-1.5 py-1 px-1.5 rounded-[4px] hover:bg-[var(--bg-subtle)] cursor-pointer text-[var(--text-main)] font-medium">
            <ChevronDown className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
            <Folder className="w-3.5 h-3.5 text-[var(--accent-primary)] shrink-0" />
            <span className="truncate">arceus-web</span>
          </div>

          {/* Diretório src/ */}
          <div className="pl-3 mt-0.5">
            <div
              onClick={() => setSrcFolderOpen(!srcFolderOpen)}
              className="flex items-center gap-1.5 py-1 px-1.5 rounded-[4px] hover:bg-[var(--bg-subtle)] cursor-pointer text-[var(--text-main)]"
            >
              {srcFolderOpen ? (
                <ChevronDown className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
              ) : (
                <ChevronRight className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
              )}
              {srcFolderOpen ? (
                <FolderOpenIcon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              ) : (
                <Folder className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              )}
              <span className="font-medium">src</span>
              <span className="text-[10px] text-[var(--text-muted)]">({files.length})</span>
            </div>

            {/* Arquivos dentro de src */}
            {srcFolderOpen && (
              <div className="pl-4 space-y-0.5 mt-0.5 border-l border-[var(--border-color)]/60 ml-2.5">
                {files.map((file) => {
                  const isActive = file.id === activeFileId;
                  const isEditing = file.id === editingId;

                  return (
                    <div
                      key={file.id}
                      onClick={() => onSelectFile(file.id)}
                      className={`flex items-center justify-between py-1 px-2 rounded-[4px] cursor-pointer transition group ${
                        isActive
                          ? 'bg-[var(--accent-primary)]/20 text-[var(--text-main)] font-semibold border-l-2 border-[var(--accent-primary)]'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <JetBrainsMlFileIcon />
                        {isEditing ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onBlur={() => handleFinishRename(file.id)}
                            onKeyDown={(e) => handleKeyDown(e, file.id)}
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[var(--bg-app)] text-[var(--text-main)] px-1 py-0.2 rounded border border-[var(--accent-primary)] text-xs w-full font-mono outline-none"
                          />
                        ) : (
                          <span
                            className="truncate text-xs font-mono"
                            title={`${file.name} (Double click to rename)`}
                            onDoubleClick={(e) => handleStartRename(file, e)}
                          >
                            {file.name}
                          </span>
                        )}
                      </div>

                      {/* Ações ao passar o mouse */}
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 shrink-0 ml-1">
                        <button
                          onClick={(e) => handleStartRename(file, e)}
                          title="Rename file"
                          className="p-0.5 rounded hover:bg-[var(--bg-app)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        {files.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onCloseFile(file.id);
                            }}
                            title="Delete file"
                            className="p-0.5 rounded hover:bg-[var(--bg-app)] text-[var(--text-muted)] hover:text-red-400"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Seção External Libraries (Autêntica do IntelliJ IDEA) */}
          <div className="mt-1">
            <div
              onClick={() => setLibrariesOpen(!librariesOpen)}
              className="flex items-center gap-1.5 py-1 px-1.5 rounded-[4px] hover:bg-[var(--bg-subtle)] cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-main)]"
            >
              {librariesOpen ? (
                <ChevronDown className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
              ) : (
                <ChevronRight className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
              )}
              <Library className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
              <span className="text-[11px]">External Libraries (Examples)</span>
            </div>

            {/* Lista de Exemplos dentro de External Libraries */}
            {librariesOpen && (
              <div className="pl-4 space-y-0.5 mt-0.5 border-l border-[var(--border-color)]/60 ml-2.5">
                {EXAMPLES.map((ex) => (
                  <div
                    key={ex.id}
                    onClick={() => onSelectExample(ex.code, ex.title)}
                    className="flex items-center justify-between py-1 px-2 rounded-[4px] cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] group"
                  >
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                      <span className="truncate text-xs font-mono" title={ex.description}>
                        {ex.title}.ml
                      </span>
                    </div>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-[var(--bg-app)] text-[var(--text-muted)] shrink-0 ml-1">
                      {ex.category}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Rodapé do Project Window */}
      <div className="h-6 px-2.5 border-t border-[var(--border-color)] bg-[var(--bg-header)] text-[10px] text-[var(--text-muted)] flex items-center justify-between shrink-0">
        <span>MiniLang SDK 0.1.0</span>
        <kbd className="px-1 py-0.2 rounded bg-[var(--bg-app)] border border-[var(--border-color)] text-[9px] text-[var(--text-muted)]">
          Alt+1
        </kbd>
      </div>
    </aside>
  );
}
