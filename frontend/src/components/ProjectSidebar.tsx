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
    <div className="w-3.5 h-3.5 rounded-[2px] bg-[#3574f0]/20 border border-[#3574f0]/50 flex items-center justify-center shrink-0">
      <span className="text-[8px] font-black font-mono text-[#56a8f5] leading-none">M</span>
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
    <aside className="w-64 h-full bg-[#2b2d30] border-r border-[#393b40] flex flex-col select-none shrink-0 font-sans text-xs text-[#dfe1e5]">
      {/* 1. Header do Painel Project (Estilo JetBrains Tool Window Header) */}
      <div className="h-7 px-2.5 bg-[#2b2d30] border-b border-[#393b40] flex items-center justify-between text-[#dfe1e5]">
        {/* Project View Dropdown */}
        <div className="flex items-center gap-1.5 cursor-pointer hover:text-white transition">
          <span className="font-semibold text-xs text-[#dfe1e5]">Project</span>
          <ChevronDown className="w-3 h-3 text-[#868a91]" />
        </div>

        {/* Ações da Tool Window (Novo arquivo, Abrir, Recolher) */}
        <div className="flex items-center gap-0.5 text-[#868a91]">
          <button
            onClick={() => onCreateFile()}
            title="New MiniLang File"
            className="p-1 rounded-[4px] hover:bg-[#35373c] hover:text-[#dfe1e5] transition"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onOpenFile}
            title="Open File..."
            className="p-1 rounded-[4px] hover:bg-[#35373c] hover:text-[#dfe1e5] transition"
          >
            <FolderOpenIcon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onCollapse}
            title="Hide Project Tool Window (Alt+1)"
            className="p-1 rounded-[4px] hover:bg-[#35373c] hover:text-[#dfe1e5] transition"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Árvore de Arquivos (JetBrains Project Tree) */}
      <div className="flex-1 overflow-y-auto py-1 text-xs">
        {/* Raiz do Projeto: arceus-web */}
        <div className="px-1.5">
          <div className="flex items-center gap-1.5 py-1 px-1.5 rounded-[4px] hover:bg-[#35373c] cursor-pointer text-[#dfe1e5] font-medium">
            <ChevronDown className="w-3 h-3 text-[#868a91] shrink-0" />
            <Folder className="w-3.5 h-3.5 text-[#3574f0] shrink-0" />
            <span className="truncate">arceus-web</span>
          </div>

          {/* Diretório src/ */}
          <div className="pl-3 mt-0.5">
            <div
              onClick={() => setSrcFolderOpen(!srcFolderOpen)}
              className="flex items-center gap-1.5 py-1 px-1.5 rounded-[4px] hover:bg-[#35373c] cursor-pointer text-[#dfe1e5]"
            >
              {srcFolderOpen ? (
                <ChevronDown className="w-3 h-3 text-[#868a91] shrink-0" />
              ) : (
                <ChevronRight className="w-3 h-3 text-[#868a91] shrink-0" />
              )}
              {srcFolderOpen ? (
                <FolderOpenIcon className="w-3.5 h-3.5 text-[#e5a83b] shrink-0" />
              ) : (
                <Folder className="w-3.5 h-3.5 text-[#e5a83b] shrink-0" />
              )}
              <span className="font-medium">src</span>
              <span className="text-[10px] text-[#868a91]">({files.length})</span>
            </div>

            {/* Arquivos dentro de src */}
            {srcFolderOpen && (
              <div className="pl-4 space-y-0.5 mt-0.5 border-l border-[#393b40]/60 ml-2.5">
                {files.map((file) => {
                  const isActive = file.id === activeFileId;
                  const isEditing = file.id === editingId;

                  return (
                    <div
                      key={file.id}
                      onClick={() => onSelectFile(file.id)}
                      className={`flex items-center justify-between py-1 px-2 rounded-[4px] cursor-pointer transition group ${
                        isActive
                          ? 'bg-[#2e436e] text-white font-medium'
                          : 'text-[#bcbec4] hover:text-[#dfe1e5] hover:bg-[#35373c]'
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
                            className="bg-[#1e1f22] text-white px-1 py-0.2 rounded border border-[#3574f0] text-xs w-full font-mono outline-none"
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
                          className="p-0.5 rounded hover:bg-[#1e1f22] text-[#868a91] hover:text-white"
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
                            className="p-0.5 rounded hover:bg-[#1e1f22] text-[#868a91] hover:text-[#f75464]"
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
              className="flex items-center gap-1.5 py-1 px-1.5 rounded-[4px] hover:bg-[#35373c] cursor-pointer text-[#868a91] hover:text-[#dfe1e5]"
            >
              {librariesOpen ? (
                <ChevronDown className="w-3 h-3 text-[#868a91] shrink-0" />
              ) : (
                <ChevronRight className="w-3 h-3 text-[#868a91] shrink-0" />
              )}
              <Library className="w-3.5 h-3.5 text-[#868a91] shrink-0" />
              <span className="text-[11px]">External Libraries (Examples)</span>
            </div>

            {/* Lista de Exemplos dentro de External Libraries */}
            {librariesOpen && (
              <div className="pl-4 space-y-0.5 mt-0.5 border-l border-[#393b40]/60 ml-2.5">
                {EXAMPLES.map((ex) => (
                  <div
                    key={ex.id}
                    onClick={() => onSelectExample(ex.code, ex.title)}
                    className="flex items-center justify-between py-1 px-2 rounded-[4px] cursor-pointer text-[#868a91] hover:text-[#dfe1e5] hover:bg-[#35373c] group"
                  >
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <Sparkles className="w-3 h-3 text-[#f5a623] shrink-0" />
                      <span className="truncate text-xs font-mono" title={ex.description}>
                        {ex.title}.ml
                      </span>
                    </div>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-[#1e1f22] text-[#868a91] shrink-0 ml-1">
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
      <div className="h-6 px-2.5 border-t border-[#393b40] bg-[#2b2d30] text-[10px] text-[#868a91] flex items-center justify-between shrink-0">
        <span>MiniLang SDK 0.1.0</span>
        <kbd className="px-1 py-0.2 rounded bg-[#1e1f22] border border-[#393b40] text-[9px] text-[#868a91]">
          Alt+1
        </kbd>
      </div>
    </aside>
  );
}
