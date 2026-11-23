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
  PanelBottom,
  PanelRight,
  Sparkles,
} from 'lucide-react';
import type { EditorFile } from '../hooks/useFiles';
import { useTheme } from '../context/ThemeContext';
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
  sidebarOpen = true,
  onToggleSidebar,
  panelPosition = 'bottom',
  onTogglePanelPosition,
  cursorLine = 1,
  onNavigateToLine,
}: EditorTabsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [copied, setCopied] = useState(false);
  const [formatted, setFormatted] = useState(false);
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

  const handleFormat = () => {
    if (onFormatCode) {
      onFormatCode();
      setFormatted(true);
      setTimeout(() => setFormatted(false), 1500);
    }
  };

  return (
    <div className="flex flex-col select-none shrink-0 bg-[var(--bg-header)] border-b border-[var(--border-color)]">
      {/* 1. Barra de Abas de Arquivos - Estilo IntelliJ IDEA */}
      <div className="flex items-center justify-between overflow-x-auto h-9">
        {/* Abas e Botão Novo Arquivo */}
        <div className="flex items-center h-full overflow-x-auto divide-x divide-[var(--border-color)]">
          {/* Botão de Toggle da Barra Lateral de Arquivos */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              title={sidebarOpen ? 'Ocultar Projeto (Alt+1)' : 'Exibir Projeto (Alt+1)'}
              className={`px-2.5 h-full text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)] transition flex items-center shrink-0 ${
                sidebarOpen ? 'text-amber-400 bg-[var(--bg-surface)]/40' : ''
              }`}
            >
              <FolderTree className="w-3.5 h-3.5" />
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
                className={`group flex items-center gap-2 px-3 py-2 border-r border-[var(--border-color)] cursor-pointer text-xs transition select-none shrink-0 relative ${
                  isActive
                    ? 'bg-[var(--bg-surface)] text-[var(--text-main)] font-semibold border-t-2'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)]/60'
                }`}
                style={isActive ? { borderTopColor: themeConfig.primaryColor } : undefined}
              >
                <FileCode
                  className="w-3.5 h-3.5 shrink-0"
                  style={{ color: isActive ? themeConfig.primaryColor : undefined }}
                />

                {isEditing ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => handleFinishRename(file.id)}
                    onKeyDown={(e) => handleKeyDown(e, file.id)}
                    className="bg-black/40 text-[var(--text-main)] px-1 py-0.5 rounded text-xs outline-none border border-amber-500 w-24 font-mono"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="truncate max-w-[140px] font-mono">{file.name}</span>
                )}

                {/* Botão fechar aba */}
                {files.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseFile(file.id);
                    }}
                    title="Fechar aba"
                    className="p-0.5 rounded hover:bg-black/30 text-[var(--text-muted)] hover:text-rose-400 opacity-0 group-hover:opacity-100 transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          <button
            onClick={onCreateFile}
            title="Novo Arquivo MiniLang com Sintaxe Padrão"
            className="px-2.5 py-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)] transition flex items-center shrink-0 border-r border-[var(--border-color)]"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Controles da Direita: Posicionamento do Painel, Formatador, Minimap e Cópia */}
        <div className="flex items-center gap-1 px-2 shrink-0">
          {/* Botão Formatar Código (TASK-3.5) */}
          {onFormatCode && (
            <button
              onClick={handleFormat}
              title="Formatar Código MiniLang (Shift + Alt + F)"
              className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-[var(--text-main)] border border-[var(--border-color)] transition active:scale-95"
            >
              <Sparkles className="w-3 h-3 text-[var(--accent-primary)]" />
              <span className="hidden sm:inline">
                {formatted ? 'Formatado!' : 'Formatar'}
              </span>
            </button>
          )}

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

      {/* 2. Breadcrumbs Contextual Ativo (TASK-3.4) */}
      <Breadcrumbs
        fileName={activeFile?.name || 'arquivo.ml'}
        sourceCode={activeFile?.content || ''}
        cursorLine={cursorLine}
        onNavigateToLine={onNavigateToLine}
      />
    </div>
  );
}
