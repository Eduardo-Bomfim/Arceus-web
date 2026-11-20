import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import {
  Plus,
  X,
  FileCode,
  Copy,
  Check,
  Map,
  FolderTree,
  ChevronRight,
  PanelBottom,
  PanelRight,
} from 'lucide-react';
import type { EditorFile } from '../hooks/useFiles';
import { useTheme } from '../context/ThemeContext';

interface EditorTabsProps {
  files: EditorFile[];
  activeFileId: string;
  onSelectFile: (id: string) => void;
  onCreateFile: () => void;
  onCloseFile: (id: string) => void;
  onRenameFile: (id: string, newName: string) => void;
  onCopyCode?: () => void;
  showMinimap?: boolean;
  onToggleMinimap?: () => void;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  panelPosition?: 'bottom' | 'right';
  onTogglePanelPosition?: () => void;
}

export function EditorTabs({
  files,
  activeFileId,
  onSelectFile,
  onCreateFile,
  onCloseFile,
  onRenameFile,
  onCopyCode,
  showMinimap = true,
  onToggleMinimap,
  sidebarOpen = true,
  onToggleSidebar,
  panelPosition = 'bottom',
  onTogglePanelPosition,
}: EditorTabsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [copied, setCopied] = useState(false);
  const { themeConfig } = useTheme();

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

  return (
    <div className="flex flex-col select-none shrink-0 bg-[var(--bg-header)] border-b border-[var(--border-color)]">
      {/* 1. Barra de Abas de Arquivos - Estilo IntelliJ IDEA */}
      <div className="flex items-center justify-between overflow-x-auto no-scrollbar text-xs border-b border-[var(--border-color)]/50">
        <div className="flex items-center flex-1 overflow-x-auto no-scrollbar">
          {/* Botão de Toggle da Barra Lateral de Arquivos (quando recolhida) */}
          {onToggleSidebar && !sidebarOpen && (
            <button
              onClick={onToggleSidebar}
              title="Abrir painel de Projeto (Alt+1)"
              className="px-2.5 py-2 text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-surface)] transition border-r border-[var(--border-color)] flex items-center gap-1 shrink-0"
            >
              <FolderTree className="w-3.5 h-3.5" style={{ color: themeConfig.primaryColor }} />
            </button>
          )}

          {files.map((file) => {
            const isActive = file.id === activeFileId;
            const isEditing = file.id === editingId;

            return (
              <div
                key={file.id}
                onClick={() => onSelectFile(file.id)}
                onDoubleClick={() => handleStartRename(file)}
                className={`flex items-center gap-2 px-3 py-1.5 border-r border-[var(--border-color)] cursor-pointer transition group shrink-0 border-t-2 ${
                  isActive
                    ? 'bg-[var(--bg-surface)] text-[var(--text-main)] font-medium shadow-sm'
                    : 'bg-[var(--bg-header)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)]/50 border-t-transparent'
                }`}
                style={
                  isActive
                    ? { borderTopColor: themeConfig.primaryColor }
                    : { borderTopColor: 'transparent' }
                }
              >
                <FileCode
                  className="w-3.5 h-3.5"
                  style={{ color: isActive ? themeConfig.primaryColor : 'var(--text-muted)' }}
                />

                {isEditing ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => handleFinishRename(file.id)}
                    onKeyDown={(e) => handleKeyDown(e, file.id)}
                    autoFocus
                    className="bg-[var(--bg-panel)] text-[var(--text-main)] px-1 py-0.5 rounded outline-none border border-amber-400 text-xs w-28"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="truncate max-w-[150px]" title="Duplo clique para renomear">
                    {file.name}
                  </span>
                )}

                {files.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseFile(file.id);
                    }}
                    title="Fechar arquivo"
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded-full hover:bg-[var(--border-color)] text-[var(--text-muted)] hover:text-white transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          {/* Botão Novo Arquivo */}
          <button
            onClick={onCreateFile}
            title="Novo Arquivo MiniLang com Sintaxe Padrão"
            className="px-2.5 py-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)] transition flex items-center shrink-0 border-r border-[var(--border-color)]"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Controles da Direita: Posicionamento do Painel, Minimap e Cópia */}
        <div className="flex items-center gap-1 px-2 shrink-0">
          {onTogglePanelPosition && (
            <button
              onClick={onTogglePanelPosition}
              title={
                panelPosition === 'bottom'
                  ? 'Reajustar Painel para a Direita (Modo Lateral)'
                  : 'Reajustar Painel para a Parte Inferior (Abaixo do Editor)'
              }
              className="p-1 rounded text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-subtle)] transition flex items-center gap-1 text-[11px]"
            >
              {panelPosition === 'bottom' ? (
                <>
                  <PanelRight className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline text-[10px]">Painel à Direita</span>
                </>
              ) : (
                <>
                  <PanelBottom className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline text-[10px]">Painel Abaixo</span>
                </>
              )}
            </button>
          )}

          {onToggleMinimap && (
            <button
              onClick={onToggleMinimap}
              title={showMinimap ? 'Ocultar Minimapa' : 'Exibir Minimapa'}
              className={`p-1.5 rounded transition ${
                showMinimap
                  ? 'text-[var(--text-main)] bg-[var(--bg-subtle)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
            </button>
          )}

          {onCopyCode && (
            <button
              onClick={handleCopy}
              title="Copiar Código do Arquivo (Ctrl+C)"
              className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-[var(--text-main)] border border-[var(--border-color)] transition active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400 text-[10px]">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-[var(--text-muted)]" />
                  <span className="hidden sm:inline">Copiar</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 2. Breadcrumbs estilo IntelliJ IDEA: arceus-web > src > programa.ml */}
      <div className="flex items-center gap-1.5 px-3 py-1 bg-[var(--bg-surface)]/40 text-[11px] text-[var(--text-muted)] font-mono border-b border-[var(--border-color)]/30">
        <span className="hover:text-[var(--text-main)] cursor-pointer">arceus-web</span>
        <ChevronRight className="w-3 h-3 text-[var(--text-muted)]/60" />
        <span className="hover:text-[var(--text-main)] cursor-pointer">src</span>
        <ChevronRight className="w-3 h-3 text-[var(--text-muted)]/60" />
        <span className="text-[var(--text-main)] font-semibold flex items-center gap-1">
          <FileCode className="w-3 h-3 text-amber-400" />
          {activeFile?.name}
        </span>
      </div>
    </div>
  );
}
