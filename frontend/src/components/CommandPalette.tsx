import { useState, useEffect, useRef } from 'react';
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
  Layers,
  Sliders,
} from 'lucide-react';
import { useTheme, THEMES } from '../context/ThemeContext';
import { EXAMPLES } from '../examples';
import type { TabType } from '../hooks/useTabs';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onRun: () => void;
  onAbort: () => void;
  onAnalyze: () => void;
  onShare: () => void;
  onDownload: () => void;
  onOpenFile: () => void;
  onClearTerminal: () => void;
  onCreateFile: () => void;
  onSelectExample: (code: string) => void;
  onSelectTab: (tab: TabType) => void;
}

interface CommandItem {
  id: string;
  category: 'Execução' | 'Temas' | 'Exemplos' | 'Navegação' | 'Arquivos';
  label: string;
  detail?: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onRun,
  onAbort,
  onAnalyze,
  onShare,
  onDownload,
  onOpenFile,
  onClearTerminal,
  onCreateFile,
  onSelectExample,
  onSelectTab,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { setTheme, setIsSettingsOpen } = useTheme();

  // Foco no input ao abrir
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Lista de todos os comandos disponíveis
  const allCommands: CommandItem[] = [
    // Execução
    {
      id: 'cmd_run',
      category: 'Execução',
      label: 'Executar Programa MiniLang',
      detail: 'Inicia compilação e execução via WebSocket interativo',
      icon: <Play className="w-4 h-4 text-emerald-400" />,
      shortcut: 'F9',
      action: onRun,
    },
    {
      id: 'cmd_abort',
      category: 'Execução',
      label: 'Interromper Execução',
      detail: 'Para o processo em andamento no servidor',
      icon: <Square className="w-4 h-4 text-rose-400" />,
      shortcut: 'Esc',
      action: onAbort,
    },
    {
      id: 'cmd_analyze',
      category: 'Execução',
      label: 'Analisar Código Estaticamente',
      detail: 'Gera AST, tabela de símbolos e checagem de tipos sem executar',
      icon: <SearchCode className="w-4 h-4 text-sky-400" />,
      action: onAnalyze,
    },
    {
      id: 'cmd_clear_terminal',
      category: 'Execução',
      label: 'Limpar Console do Terminal',
      detail: 'Remove todas as saídas impressas na tela',
      icon: <Trash2 className="w-4 h-4 text-slate-400" />,
      shortcut: 'Ctrl+L',
      action: onClearTerminal,
    },

    // Arquivos & Compartilhamento
    {
      id: 'cmd_share',
      category: 'Arquivos',
      label: 'Compartilhar Código (Copiar Link)',
      detail: 'Gera link com o código codificado em Base64 para envio',
      icon: <Share2 className="w-4 h-4 text-amber-400" />,
      action: onShare,
    },
    {
      id: 'cmd_new_file',
      category: 'Arquivos',
      label: 'Novo Arquivo MiniLang',
      detail: 'Cria uma nova aba de arquivo no editor',
      icon: <FileCode className="w-4 h-4 text-sky-400" />,
      action: onCreateFile,
    },
    {
      id: 'cmd_download',
      category: 'Arquivos',
      label: 'Baixar Código Fonte (.ml)',
      detail: 'Salva o arquivo atual no seu computador',
      icon: <Download className="w-4 h-4 text-slate-400" />,
      action: onDownload,
    },
    {
      id: 'cmd_open_file',
      category: 'Arquivos',
      label: 'Abrir Arquivo Local (.ml)',
      detail: 'Carrega um arquivo MiniLang do computador',
      icon: <FolderOpen className="w-4 h-4 text-slate-400" />,
      action: onOpenFile,
    },

    // Temas & Configurações
    {
      id: 'cmd_open_settings',
      category: 'Temas' as const,
      label: 'Abrir Configurações e Temas',
      detail: 'Personalizar paleta dos Guardiões, tipografia, ligaduras e atalhos na gaveta lateral',
      icon: <Sliders className="w-4 h-4 text-amber-400" />,
      shortcut: 'Ctrl+,',
      action: () => setIsSettingsOpen(true),
    },
    ...THEMES.map((th) => ({
      id: `cmd_theme_${th.id}`,
      category: 'Temas' as const,
      label: `Tema: ${th.name}`,
      detail: th.subtitle,
      icon: (
        <div
          className="w-3.5 h-3.5 rounded-full border border-white/20"
          style={{ backgroundColor: th.primaryColor }}
        />
      ),
      action: () => setTheme(th.id),
    })),

    // Navegação de Abas
    {
      id: 'cmd_nav_console',
      category: 'Navegação',
      label: 'Ir para Aba: Console / Terminal',
      icon: <Layers className="w-4 h-4 text-sky-400" />,
      action: () => onSelectTab('console'),
    },
    {
      id: 'cmd_nav_problems',
      category: 'Navegação',
      label: 'Ir para Aba: Problemas & Diagnósticos',
      icon: <Layers className="w-4 h-4 text-rose-400" />,
      action: () => onSelectTab('problems'),
    },
    {
      id: 'cmd_nav_ast',
      category: 'Navegação',
      label: 'Ir para Aba: AST (Árvore Sintática)',
      icon: <Layers className="w-4 h-4 text-indigo-400" />,
      action: () => onSelectTab('ast'),
    },
    {
      id: 'cmd_nav_symbols',
      category: 'Navegação',
      label: 'Ir para Aba: Tabela de Símbolos',
      icon: <Layers className="w-4 h-4 text-cyan-400" />,
      action: () => onSelectTab('symbols'),
    },
    {
      id: 'cmd_nav_tokens',
      category: 'Navegação',
      label: 'Ir para Aba: Tokens Léxicos',
      icon: <Layers className="w-4 h-4 text-amber-400" />,
      action: () => onSelectTab('tokens'),
    },
    {
      id: 'cmd_nav_cfg',
      category: 'Navegação',
      label: 'Ir para Aba: Grafo de Fluxo de Controle (CFG)',
      icon: <Layers className="w-4 h-4 text-emerald-400" />,
      action: () => onSelectTab('cfg'),
    },

    // Exemplos
    ...EXAMPLES.map((ex) => ({
      id: `cmd_ex_${ex.id}`,
      category: 'Exemplos' as const,
      label: `Carregar Exemplo: ${ex.title}`,
      detail: ex.description,
      icon: <BookOpen className="w-4 h-4 text-indigo-400" />,
      action: () => onSelectExample(ex.code),
    })),
  ];

  // Filtro de busca
  const filtered = allCommands.filter((c) => {
    const text = `${c.category} ${c.label} ${c.detail || ''}`.toLowerCase();
    return text.includes(query.toLowerCase());
  });

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((idx) => (idx + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((idx) => (idx - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-20 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-2xl overflow-hidden flex flex-col max-h-[70vh] animate-[scaleIn_0.15s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Campo de Busca */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-header)]">
          <Search className="w-4 h-4 text-[var(--text-muted)]" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Digite um comando ou busque exemplos, temas, abas..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-[var(--text-main)] placeholder-[var(--text-muted)] text-sm font-sans"
          />
          <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-panel)] text-[10px] text-[var(--text-muted)] border border-[var(--border-color)]">
            ESC
          </kbd>
        </div>

        {/* Lista de Resultados */}
        <div className="flex-1 overflow-y-auto divide-y divide-[var(--border-color)]/50 p-1.5">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--text-muted)] italic">
              Nenhum comando correspondente encontrado para "{query}".
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition text-xs ${
                    isSelected
                      ? 'bg-[var(--bg-active-tab)] text-white'
                      : 'text-[var(--text-main)] hover:bg-[var(--bg-subtle)]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-1.5 rounded-md bg-[var(--bg-panel)] shrink-0">
                      {item.icon}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold truncate">{item.label}</span>
                        <span className="text-[10px] text-[var(--text-muted)] bg-[var(--bg-panel)] px-1.5 py-0.2 rounded border border-[var(--border-color)]">
                          {item.category}
                        </span>
                      </div>
                      {item.detail && (
                        <span className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
                          {item.detail}
                        </span>
                      )}
                    </div>
                  </div>

                  {item.shortcut && (
                    <kbd className="px-2 py-0.5 rounded bg-[var(--bg-panel)] text-[10px] text-[var(--text-muted)] border border-[var(--border-color)] shrink-0 font-mono">
                      {item.shortcut}
                    </kbd>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer com atalhos de navegação */}
        <div className="px-4 py-2 bg-[var(--bg-header)] border-t border-[var(--border-color)] flex items-center justify-between text-[11px] text-[var(--text-muted)] select-none">
          <div className="flex items-center gap-3">
            <span>↑↓ para navegar</span>
            <span>↵ para executar</span>
          </div>
          <span>Paleta de Comandos (Ctrl+Shift+P)</span>
        </div>
      </div>
    </div>
  );
}
