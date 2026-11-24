import { useState, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import {
  Search,
  Play,
  Square,
  SearchCode,
  Share2,
  Download,
  FolderOpen,
  Trash2,
  FileCode,
  BookOpen,
  Settings,
  Sparkles,
  PanelLeft,
  Terminal as TerminalIcon,
  Zap,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { THEMES } from '../context/themePresets';
import { EXAMPLES } from '../examples';
import type { TabType } from '../hooks/useTabs';
import type { EditorFile } from '../hooks/useFiles';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  files: EditorFile[];
  activeFileId: string;
  onSelectFile: (id: string) => void;
  onRun: () => void;
  onAbort: () => void;
  onAnalyze: () => void;
  onShare: () => void;
  onDownload: () => void;
  onOpenFile: () => void;
  onClearTerminal: () => void;
  onCreateFile: () => void;
  onFormatCode?: () => void;
  onToggleSidebar: () => void;
  onToggleOptimize: () => void;
  optimize: boolean;
  onSelectExample: (code: string, title?: string) => void;
  onSelectTab: (tab: TabType) => void;
}

interface CommandItem {
  id: string;
  category: 'Ações' | 'Arquivos' | 'Temas' | 'Exemplos';
  label: string;
  detail?: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
}

type FilterTab = 'Tudo' | 'Ações' | 'Arquivos' | 'Exemplos' | 'Temas';

function CommandPaletteDialog({
  onClose,
  files,
  activeFileId,
  onSelectFile,
  onRun,
  onAbort,
  onAnalyze,
  onShare,
  onDownload,
  onOpenFile,
  onClearTerminal,
  onCreateFile,
  onFormatCode,
  onToggleSidebar,
  onToggleOptimize,
  optimize,
  onSelectExample,
  onSelectTab,
}: Omit<CommandPaletteProps, 'isOpen'>) {
  const [query, setQuery] = useState('');
  const [currentTab, setCurrentTab] = useState<FilterTab>('Tudo');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { setTheme, openSettings, theme: activeTheme } = useTheme();

  const allCommands: CommandItem[] = [
    {
      id: 'cmd_run',
      category: 'Ações',
      label: 'Executar Programa no Terminal',
      detail: 'Compila e executa o arquivo ativo via WebSocket interativo',
      icon: <Play className="w-4 h-4 text-[var(--accent-secondary)]" />,
      shortcut: 'F9',
      action: onRun,
    },
    {
      id: 'cmd_abort',
      category: 'Ações',
      label: 'Parar Execução',
      detail: 'Interrompe o processo em execução',
      icon: <Square className="w-4 h-4 text-rose-400" />,
      shortcut: 'Esc',
      action: onAbort,
    },
    {
      id: 'cmd_analyze',
      category: 'Ações',
      label: 'Analisar Código (Léxico, Sintático e Semântico)',
      detail: 'Atualiza diagnósticos, AST, CFG, Símbolos e Tokens',
      icon: <SearchCode className="w-4 h-4 text-[var(--accent-primary)]" />,
      action: onAnalyze,
    },
    {
      id: 'cmd_format',
      category: 'Ações',
      label: 'Formatar Código MiniLang',
      detail: 'Organiza indentação e espaçamento do arquivo atual',
      icon: <Sparkles className="w-4 h-4 text-[var(--accent-primary)]" />,
      shortcut: 'Shift+Alt+F',
      action: () => onFormatCode?.(),
    },
    {
      id: 'cmd_opt',
      category: 'Ações',
      label: optimize
        ? 'Desativar Constant Folding (--opt)'
        : 'Ativar Constant Folding (--opt)',
      detail: 'Alterna otimização de expressões constantes em tempo de compilação',
      icon: <Zap className="w-4 h-4 text-amber-400" />,
      action: onToggleOptimize,
    },
    {
      id: 'cmd_sidebar',
      category: 'Ações',
      label: 'Alternar Explorador de Arquivos',
      detail: 'Mostra ou oculta a barra lateral do projeto',
      icon: <PanelLeft className="w-4 h-4 text-[var(--text-muted)]" />,
      shortcut: 'Alt+1',
      action: onToggleSidebar,
    },
    {
      id: 'cmd_new_file',
      category: 'Ações',
      label: 'Novo Arquivo MiniLang',
      detail: 'Cria um novo arquivo .ml no projeto',
      icon: <FileCode className="w-4 h-4 text-[var(--accent-primary)]" />,
      action: onCreateFile,
    },
    {
      id: 'cmd_open_file',
      category: 'Ações',
      label: 'Abrir Arquivo Local...',
      detail: 'Importa um arquivo .ml ou .txt do seu computador',
      icon: <FolderOpen className="w-4 h-4 text-amber-400" />,
      action: onOpenFile,
    },
    {
      id: 'cmd_download',
      category: 'Ações',
      label: 'Baixar Código Fonte (.ml)',
      detail: 'Salva o arquivo ativo em seu dispositivo',
      icon: <Download className="w-4 h-4 text-[var(--text-muted)]" />,
      action: onDownload,
    },
    {
      id: 'cmd_share',
      category: 'Ações',
      label: 'Compartilhar Código via Link',
      detail: 'Gera link codificado com o programa atual',
      icon: <Share2 className="w-4 h-4 text-[var(--accent-primary)]" />,
      action: onShare,
    },
    {
      id: 'cmd_clear_term',
      category: 'Ações',
      label: 'Limpar Terminal',
      detail: 'Remove as linhas anteriores da janela de terminal',
      icon: <Trash2 className="w-4 h-4 text-[var(--text-muted)]" />,
      shortcut: 'Ctrl+L',
      action: onClearTerminal,
    },
    {
      id: 'cmd_settings_appearance',
      category: 'Ações',
      label: 'Configurações de Aparência e Temas',
      detail: 'Personalize temas, cores, densidade, fontes e editor',
      icon: <Settings className="w-4 h-4 text-[var(--accent-primary)]" />,
      shortcut: 'Ctrl+,',
      action: () => openSettings('appearance'),
    },
    {
      id: 'nav_terminal',
      category: 'Ações',
      label: 'Painel: Terminal Interativo',
      icon: <TerminalIcon className="w-4 h-4 text-[var(--accent-primary)]" />,
      shortcut: 'Alt+4',
      action: () => onSelectTab('console'),
    },
    {
      id: 'nav_problems',
      category: 'Ações',
      label: 'Painel: Problemas e Diagnósticos',
      icon: <SearchCode className="w-4 h-4 text-rose-400" />,
      shortcut: 'Alt+6',
      action: () => onSelectTab('problems'),
    },
    {
      id: 'nav_ast',
      category: 'Ações',
      label: 'Painel: Árvore Sintática (AST)',
      icon: <Sparkles className="w-4 h-4 text-[var(--accent-secondary)]" />,
      action: () => onSelectTab('ast'),
    },
    {
      id: 'nav_cfg',
      category: 'Ações',
      label: 'Painel: Grafo de Fluxo (CFG)',
      icon: <Sparkles className="w-4 h-4 text-purple-400" />,
      action: () => onSelectTab('cfg'),
    },
    // Arquivos abertos no workspace
    ...files.map((f) => ({
      id: `file_${f.id}`,
      category: 'Arquivos' as const,
      label: f.name,
      detail: `${f.content.split('\n').length} linhas no workspace`,
      icon: <FileCode className="w-4 h-4 text-[var(--accent-primary)]" />,
      shortcut: f.id === activeFileId ? 'Ativo' : undefined,
      action: () => onSelectFile(f.id),
    })),
    // Temas
    ...THEMES.map((t) => ({
      id: `theme_${t.id}`,
      category: 'Temas' as const,
      label: `Tema: ${t.name}`,
      detail: t.description,
      icon: (
        <div
          className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
          style={{ backgroundColor: t.primaryColor }}
        />
      ),
      shortcut: activeTheme === t.id ? 'Ativo' : undefined,
      action: () => setTheme(t.id),
    })),
    // Exemplos
    ...EXAMPLES.map((ex) => ({
      id: `ex_${ex.id}`,
      category: 'Exemplos' as const,
      label: ex.title,
      detail: `${ex.category} — ${ex.description}`,
      icon: <BookOpen className="w-4 h-4 text-[var(--accent-primary)]" />,
      action: () => onSelectExample(ex.code, ex.title),
    })),
  ];

  const filteredCommands = allCommands.filter((cmd) => {
    if (currentTab !== 'Tudo' && cmd.category !== currentTab) {
      return false;
    }
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      cmd.label.toLowerCase().includes(q) ||
      (cmd.detail && cmd.detail.toLowerCase().includes(q))
    );
  });

  const tabs: FilterTab[] = ['Tudo', 'Ações', 'Arquivos', 'Exemplos', 'Temas'];

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(
        (prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length)
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = filteredCommands[selectedIndex];
      if (target) {
        target.action();
        onClose();
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const idx = (tabs.indexOf(currentTab) + 1) % tabs.length;
      setCurrentTab(tabs[idx]);
      setSelectedIndex(0);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-start justify-center pt-16 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-[var(--ui-radius-lg)] shadow-2xl overflow-hidden flex flex-col select-none transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Campo de Busca Principal */}
        <div className="px-4 py-3 bg-[var(--bg-surface)] flex items-center gap-3 border-b border-[var(--border-subtle)]">
          <Search className="w-4 h-4 text-[var(--accent-primary)] shrink-0" />
          <input
            ref={inputRef}
            autoFocus
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Digite um comando, arquivo, exemplo ou tema..."
            className="flex-1 bg-transparent border-none outline-none text-[var(--text-main)] placeholder-[var(--text-muted)] text-sm focus:ring-0"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-[var(--text-muted)] hover:text-[var(--text-main)] text-xs px-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* Abas de Filtro */}
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-[var(--border-faint)] bg-[var(--bg-panel)]">
          <div className="flex items-center gap-1 text-xs overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setCurrentTab(tab);
                  setSelectedIndex(0);
                }}
                className={`px-2.5 py-1 rounded-[var(--ui-radius)] font-medium transition ${
                  currentTab === tab
                    ? 'bg-[var(--bg-surface)] text-[var(--text-main)] shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <span className="text-[10.5px] text-[var(--text-muted)] font-mono hidden sm:inline">
            Tab alterna categoria
          </span>
        </div>

        {/* Resultados */}
        <div className="max-h-96 overflow-y-auto py-1.5 px-1.5 bg-[var(--bg-panel)] space-y-0.5">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-[var(--text-muted)] text-xs">
              Nenhum resultado encontrado para &quot;{query}&quot;
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={cmd.id}
                  onClick={() => {
                    cmd.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2 rounded-[var(--ui-radius)] cursor-pointer transition text-xs ${
                    isSelected
                      ? 'bg-[var(--accent-soft)] text-[var(--text-main)]'
                      : 'text-[var(--text-main)] hover:bg-[var(--bg-subtle-soft)]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="shrink-0">{cmd.icon}</div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium truncate">{cmd.label}</span>
                      {cmd.detail && (
                        <span className="text-[11px] truncate text-[var(--text-muted)]">
                          {cmd.detail}
                        </span>
                      )}
                    </div>
                  </div>

                  {cmd.shortcut && (
                    <kbd className="text-[10px] px-1.5 py-0.5 rounded font-mono ml-2 shrink-0 bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                      {cmd.shortcut}
                    </kbd>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Rodapé discreto */}
        <div className="px-3.5 py-2 bg-[var(--bg-surface)] border-t border-[var(--border-faint)] text-[10.5px] text-[var(--text-muted)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>↑↓ navegar</span>
            <span>↵ confirmar</span>
            <span>Esc fechar</span>
          </div>
          <span>Paleta de Comandos</span>
        </div>
      </div>
    </div>
  );
}

export function CommandPalette(props: CommandPaletteProps) {
  if (!props.isOpen) return null;
  return <CommandPaletteDialog {...props} />;
}
