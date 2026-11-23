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
  Settings,
  Sparkles,
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
  onFormatCode?: () => void;
  onSelectExample: (code: string) => void;
  onSelectTab: (tab: TabType) => void;
}

interface CommandItem {
  id: string;
  category: 'Actions' | 'Files' | 'Themes' | 'Examples';
  label: string;
  detail?: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
}

type FilterTab = 'All' | 'Actions' | 'Files' | 'Examples' | 'Themes';

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
  onFormatCode,
  onSelectExample,
  onSelectTab,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [currentTab, setCurrentTab] = useState<FilterTab>('All');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { setTheme, setIsSettingsOpen, theme: activeTheme } = useTheme();

  // Foco no input ao abrir
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setCurrentTab('All');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Lista de comandos disponíveis
  const allCommands: CommandItem[] = [
    // Actions
    {
      id: 'cmd_run',
      category: 'Actions',
      label: 'Run Program (main.ml)',
      detail: 'Execute program via interactive WebSocket',
      icon: <Play className="w-4 h-4 text-[#59a869]" />,
      shortcut: 'F9',
      action: onRun,
    },
    {
      id: 'cmd_abort',
      category: 'Actions',
      label: 'Stop Execution',
      detail: 'Terminate the running MiniLang process',
      icon: <Square className="w-4 h-4 text-[#f75464]" />,
      shortcut: 'Esc',
      action: onAbort,
    },
    {
      id: 'cmd_format',
      category: 'Actions',
      label: 'Reformat Code',
      detail: 'Format MiniLang source code (2 spaces)',
      icon: <Sparkles className="w-4 h-4 text-[#3574f0]" />,
      shortcut: 'Ctrl+Alt+L',
      action: () => onFormatCode?.(),
    },
    {
      id: 'cmd_analyze',
      category: 'Actions',
      label: 'Inspect / Run Analysis',
      detail: 'Static type checking, symbol table and AST validation',
      icon: <SearchCode className="w-4 h-4 text-[#3574f0]" />,
      shortcut: 'Ctrl+Shift+I',
      action: onAnalyze,
    },
    {
      id: 'cmd_clear_term',
      category: 'Actions',
      label: 'Clear Terminal Console',
      detail: 'Clear all outputs from terminal',
      icon: <Trash2 className="w-4 h-4 text-[#868a91]" />,
      shortcut: 'Ctrl+L',
      action: onClearTerminal,
    },
    {
      id: 'cmd_settings',
      category: 'Actions',
      label: 'Open Settings',
      detail: 'Configure fonts, ligatures, minimap and themes',
      icon: <Settings className="w-4 h-4 text-[#3574f0]" />,
      shortcut: 'Ctrl+,',
      action: () => setIsSettingsOpen(true),
    },
    {
      id: 'cmd_share',
      category: 'Actions',
      label: 'Share Project',
      detail: 'Copy encoded URL link to clipboard',
      icon: <Share2 className="w-4 h-4 text-[#3574f0]" />,
      action: onShare,
    },

    // Files
    {
      id: 'cmd_new_file',
      category: 'Files',
      label: 'New MiniLang File',
      detail: 'Create an empty file in editor',
      icon: <FileCode className="w-4 h-4 text-[#3574f0]" />,
      shortcut: 'Ctrl+N',
      action: onCreateFile,
    },
    {
      id: 'cmd_open_file',
      category: 'Files',
      label: 'Open Local File...',
      detail: 'Load .ml file from disk',
      icon: <FolderOpen className="w-4 h-4 text-[#e5a83b]" />,
      shortcut: 'Ctrl+O',
      action: onOpenFile,
    },
    {
      id: 'cmd_download',
      category: 'Files',
      label: 'Export / Save File',
      detail: 'Download active file as .ml',
      icon: <Download className="w-4 h-4 text-[#59a869]" />,
      shortcut: 'Ctrl+S',
      action: onDownload,
    },

    // Tool Windows (Actions)
    {
      id: 'nav_terminal',
      category: 'Actions',
      label: 'Tool Window: Run / Terminal',
      detail: 'Open Console tool window',
      icon: <Play className="w-4 h-4 text-[#59a869]" />,
      shortcut: 'Alt+4',
      action: () => onSelectTab('console'),
    },
    {
      id: 'nav_problems',
      category: 'Actions',
      label: 'Tool Window: Problems',
      detail: 'Open diagnostics tool window',
      icon: <SearchCode className="w-4 h-4 text-[#f75464]" />,
      shortcut: 'Alt+6',
      action: () => onSelectTab('problems'),
    },
    {
      id: 'nav_ast',
      category: 'Actions',
      label: 'Tool Window: AST Inspector',
      detail: 'Open Abstract Syntax Tree viewer',
      icon: <Sparkles className="w-4 h-4 text-[#3574f0]" />,
      action: () => onSelectTab('ast'),
    },

    // Themes
    ...THEMES.map((t) => ({
      id: `theme_${t.id}`,
      category: 'Themes' as const,
      label: `Theme: ${t.name}`,
      detail: t.description,
      icon: (
        <div
          className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
          style={{ backgroundColor: t.primaryColor }}
        />
      ),
      shortcut: activeTheme === t.id ? 'Active' : undefined,
      action: () => setTheme(t.id),
    })),

    // Examples
    ...EXAMPLES.map((ex) => ({
      id: `ex_${ex.id}`,
      category: 'Examples' as const,
      label: `Example: ${ex.title}`,
      detail: `${ex.category} — ${ex.description}`,
      icon: <BookOpen className="w-4 h-4 text-[#3574f0]" />,
      action: () => onSelectExample(ex.code),
    })),
  ];

  // Filtro por tab e busca
  const filteredCommands = allCommands.filter((cmd) => {
    if (currentTab !== 'All' && cmd.category !== currentTab) {
      return false;
    }
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      cmd.label.toLowerCase().includes(q) ||
      (cmd.detail && cmd.detail.toLowerCase().includes(q))
    );
  });

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
        onClose();
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const tabs: FilterTab[] = ['All', 'Actions', 'Files', 'Examples', 'Themes'];
      const nextIdx = (tabs.indexOf(currentTab) + 1) % tabs.length;
      setCurrentTab(tabs[nextIdx]);
      setSelectedIndex(0);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-16 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#2b2d30] border border-[#393b40] rounded-[8px] shadow-2xl overflow-hidden flex flex-col font-sans select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Header do JetBrains Search Everywhere com Abas */}
        <div className="flex items-center justify-between px-3 pt-2 pb-1.5 border-b border-[#393b40] bg-[#2b2d30]">
          {/* Abas Superiores do JetBrains Search Everywhere */}
          <div className="flex items-center gap-1 text-xs">
            {(['All', 'Actions', 'Files', 'Examples', 'Themes'] as FilterTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setCurrentTab(tab);
                  setSelectedIndex(0);
                }}
                className={`px-2.5 py-1 rounded-[4px] font-medium transition ${
                  currentTab === tab
                    ? 'bg-[#1e1f22] text-[#dfe1e5] shadow-sm'
                    : 'text-[#868a91] hover:text-[#dfe1e5] hover:bg-[#35373c]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <span className="text-[10px] text-[#868a91] font-mono">
            Tab to switch tabs
          </span>
        </div>

        {/* 2. Campo de Busca JetBrains */}
        <div className="p-2.5 bg-[#1e1f22] flex items-center gap-2 border-b border-[#393b40]">
          <Search className="w-4 h-4 text-[#868a91] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type to search everywhere... (e.g. run, file, theme)"
            className="flex-1 bg-transparent border-none outline-none text-[#dfe1e5] placeholder-[#868a91] text-xs font-sans focus:ring-0"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-[#868a91] hover:text-[#dfe1e5] text-xs px-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* 3. Lista de Resultados com Visual JetBrains */}
        <div className="max-h-96 overflow-y-auto divide-y divide-[#393b40]/30 py-1 bg-[#2b2d30]">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-[#868a91] text-xs">
              No matching actions or files found for &quot;{query}&quot;
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
                  className={`flex items-center justify-between px-3.5 py-2 cursor-pointer transition text-xs ${
                    isSelected
                      ? 'bg-[#2e436e] text-white'
                      : 'text-[#dfe1e5] hover:bg-[#35373c]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="shrink-0">{cmd.icon}</div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium truncate">{cmd.label}</span>
                      {cmd.detail && (
                        <span
                          className={`text-[11px] truncate ${
                            isSelected ? 'text-white/80' : 'text-[#868a91]'
                          }`}
                        >
                          {cmd.detail}
                        </span>
                      )}
                    </div>
                  </div>

                  {cmd.shortcut && (
                    <kbd
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono ml-2 shrink-0 ${
                        isSelected
                          ? 'bg-[#1e1f22] text-white border border-[#3574f0]'
                          : 'bg-[#1e1f22] text-[#868a91] border border-[#393b40]'
                      }`}
                    >
                      {cmd.shortcut}
                    </kbd>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* 4. Rodapé com Atalhos de Navegação */}
        <div className="px-3.5 py-2 bg-[#2b2d30] border-t border-[#393b40] text-[10px] text-[#868a91] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
            <span>Tab to cycle tabs</span>
            <span>Esc to cancel</span>
          </div>
          <span>JetBrains Search Everywhere</span>
        </div>
      </div>
    </div>
  );
}
