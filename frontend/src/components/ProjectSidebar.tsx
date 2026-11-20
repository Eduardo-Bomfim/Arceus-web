import React, { useState } from 'react';
import type { KeyboardEvent } from 'react';
import {
  FolderTree,
  Folder,
  FolderOpen as FolderOpenIcon,
  FileCode,
  Plus,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronRight,
  BookOpen,
  ChevronsLeft,
  Sparkles,
} from 'lucide-react';
import type { EditorFile } from '../hooks/useFiles';
import { EXAMPLES } from '../examples';
import { useTheme } from '../context/ThemeContext';

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
  const { themeConfig } = useTheme();
  const [srcFolderOpen, setSrcFolderOpen] = useState(true);
  const [examplesFolderOpen, setExamplesFolderOpen] = useState(false);
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
    <aside className="w-64 h-full bg-[var(--bg-header)] border-r border-[var(--border-color)] flex flex-col select-none shrink-0 transition-all duration-200">
      {/* Cabeçalho do Projeto - Estilo IntelliJ IDEA */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border-color)] bg-[var(--bg-header)] text-xs text-[var(--text-muted)]">
        <div className="flex items-center gap-2 font-semibold text-[var(--text-main)] uppercase tracking-wider text-[11px]">
          <FolderTree className="w-3.5 h-3.5" style={{ color: themeConfig.primaryColor }} />
          <span>Projeto</span>
          <span className="text-[10px] text-[var(--text-muted)] font-normal lowercase">
            arceus-web
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onCreateFile()}
            title="Novo Arquivo MiniLang (com sintaxe padrão)"
            className="p-1 rounded hover:bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-white transition"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onOpenFile}
            title="Abrir arquivo do computador..."
            className="p-1 rounded hover:bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-white transition"
          >
            <FolderOpenIcon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onCollapse}
            title="Recolher painel de projeto (Alt+1)"
            className="p-1 rounded hover:bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-white transition"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Árvore de Arquivos - Estrutura de Diretórios estilo IntelliJ IDEA */}
      <div className="flex-1 overflow-y-auto px-1 py-1.5 text-xs font-mono">
        {/* Pasta do Código Fonte (src) */}
        <div>
          <div
            onClick={() => setSrcFolderOpen(!srcFolderOpen)}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded cursor-pointer hover:bg-[var(--bg-surface)] text-[var(--text-main)] group"
          >
            {srcFolderOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            )}
            {srcFolderOpen ? (
              <FolderOpenIcon className="w-4 h-4 text-amber-400/90" />
            ) : (
              <Folder className="w-4 h-4 text-amber-400/90" />
            )}
            <span className="font-semibold text-xs tracking-tight">src</span>
            <span className="text-[10px] text-[var(--text-muted)] font-normal">
              ({files.length})
            </span>
          </div>

          {/* Lista de Arquivos dentro de src/ */}
          {srcFolderOpen && (
            <div className="pl-4 space-y-0.5 mt-0.5 border-l border-[var(--border-color)] ml-3.5">
              {files.map((file) => {
                const isActive = file.id === activeFileId;
                const isEditing = file.id === editingId;

                return (
                  <div
                    key={file.id}
                    onClick={() => onSelectFile(file.id)}
                    className={`flex items-center justify-between px-2 py-1.5 rounded cursor-pointer transition group ${
                      isActive
                        ? 'bg-[var(--bg-active-tab)] text-white font-medium border-l-2'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)]'
                    }`}
                    style={
                      isActive
                        ? { borderLeftColor: themeConfig.primaryColor }
                        : undefined
                    }
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <FileCode
                        className="w-3.5 h-3.5 shrink-0"
                        style={{
                          color: isActive ? themeConfig.primaryColor : 'var(--text-muted)',
                        }}
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
                          className="bg-[var(--bg-panel)] text-[var(--text-main)] px-1 py-0.5 rounded outline-none border border-amber-400 text-xs w-full"
                        />
                      ) : (
                        <span
                          className="truncate text-xs"
                          title={`${file.name} (Duplo clique para renomear)`}
                          onDoubleClick={(e) => handleStartRename(file, e)}
                        >
                          {file.name}
                        </span>
                      )}
                    </div>

                    {/* Ações de Arquivo ao passar o mouse */}
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0 ml-1">
                      <button
                        onClick={(e) => handleStartRename(file, e)}
                        title="Renomear arquivo"
                        className="p-0.5 rounded hover:bg-[var(--border-color)] text-[var(--text-muted)] hover:text-white"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      {files.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onCloseFile(file.id);
                          }}
                          title="Excluir/Fechar arquivo"
                          className="p-0.5 rounded hover:bg-rose-950/80 text-[var(--text-muted)] hover:text-rose-400"
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

        {/* Pasta de Exemplos / Templates da MiniLang */}
        <div className="mt-2">
          <div
            onClick={() => setExamplesFolderOpen(!examplesFolderOpen)}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded cursor-pointer hover:bg-[var(--bg-surface)] text-[var(--text-main)] group"
          >
            {examplesFolderOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            )}
            <BookOpen className="w-4 h-4 text-sky-400" />
            <span className="font-semibold text-xs tracking-tight">exemplos</span>
            <span className="text-[10px] text-[var(--text-muted)] font-normal">
              ({EXAMPLES.length})
            </span>
          </div>

          {examplesFolderOpen && (
            <div className="pl-4 space-y-0.5 mt-0.5 border-l border-[var(--border-color)] ml-3.5">
              {EXAMPLES.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => onSelectExample(ex.code, ex.title)}
                  className="flex items-center justify-between px-2 py-1 rounded cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)] group"
                >
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="truncate text-xs" title={ex.description}>
                      {ex.title}.ml
                    </span>
                  </div>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-[var(--bg-panel)] text-[var(--text-muted)] border border-[var(--border-color)] shrink-0 ml-1">
                    {ex.category}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Rodapé da Barra Lateral - Atalho IntelliJ */}
      <div className="px-3 py-1.5 border-t border-[var(--border-color)] bg-[var(--bg-header)] text-[10px] text-[var(--text-muted)] flex items-center justify-between">
        <span>MiniLang SDK</span>
        <kbd className="px-1 py-0.5 rounded bg-[var(--bg-panel)] border border-[var(--border-color)] text-[9px]">
          Alt+1
        </kbd>
      </div>
    </aside>
  );
}
