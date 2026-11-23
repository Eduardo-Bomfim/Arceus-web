import {
  FolderTree,
  Terminal,
  AlertOctagon,
  Palette,
  Settings,
  Workflow,
  Network,
  ListTree,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import type { TabType } from '../hooks/useTabs';

interface ActivityBarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  isToolWindowVisible: boolean;
  onToggleToolWindow: () => void;
  onOpenCommandPalette: () => void;
  isRunning: boolean;
  onRun: () => void;
  onAbort: () => void;
  errorsCount: number;
}

export function ActivityBar({
  sidebarOpen,
  onToggleSidebar,
  activeTab,
  onSelectTab,
  isToolWindowVisible,
  onToggleToolWindow,
  errorsCount,
}: ActivityBarProps) {
  const { themeConfig, setTheme, theme, setIsSettingsOpen } = useTheme();

  return (
    <aside className="w-10 bg-[var(--bg-app)] border-r border-[var(--border-color)] flex flex-col items-center justify-between py-1.5 select-none shrink-0 z-20 transition-colors">
      {/* Topo: Tool Windows Primárias do JetBrains */}
      <div className="flex flex-col items-center gap-1 w-full">
        {/* Project Tool Window (Alt+1) */}
        <button
          onClick={onToggleSidebar}
          title="Project (Alt+1)"
          className={`w-8 h-8 rounded-[4px] transition relative flex items-center justify-center ${
            sidebarOpen
              ? 'bg-[var(--bg-panel)] text-[var(--text-main)] shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]'
          }`}
        >
          {sidebarOpen && (
            <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[var(--accent-primary)] rounded-r" />
          )}
          <FolderTree className="w-4 h-4" />
        </button>

        {/* Structure / Símbolos (Alt+7 no IntelliJ) */}
        <button
          onClick={() => {
            onSelectTab('symbols');
            if (!isToolWindowVisible) onToggleToolWindow();
          }}
          title="Structure / Symbols (Alt+7)"
          className={`w-8 h-8 rounded-[4px] transition relative flex items-center justify-center ${
            isToolWindowVisible && activeTab === 'symbols'
              ? 'bg-[var(--bg-panel)] text-[var(--text-main)] shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]'
          }`}
        >
          {isToolWindowVisible && activeTab === 'symbols' && (
            <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[var(--accent-primary)] rounded-r" />
          )}
          <ListTree className="w-4 h-4" />
        </button>

        {/* AST Inspector */}
        <button
          onClick={() => {
            onSelectTab('ast');
            if (!isToolWindowVisible) onToggleToolWindow();
          }}
          title="Compiler AST Inspector"
          className={`w-8 h-8 rounded-[4px] transition relative flex items-center justify-center ${
            isToolWindowVisible && activeTab === 'ast'
              ? 'bg-[var(--bg-panel)] text-[var(--text-main)] shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]'
          }`}
        >
          {isToolWindowVisible && activeTab === 'ast' && (
            <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[var(--accent-primary)] rounded-r" />
          )}
          <Workflow className="w-4 h-4" />
        </button>

        {/* CFG / Flow */}
        <button
          onClick={() => {
            onSelectTab('cfg');
            if (!isToolWindowVisible) onToggleToolWindow();
          }}
          title="Control Flow Graph (CFG)"
          className={`w-8 h-8 rounded-[4px] transition relative flex items-center justify-center ${
            isToolWindowVisible && activeTab === 'cfg'
              ? 'bg-[var(--bg-panel)] text-[var(--text-main)] shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]'
          }`}
        >
          {isToolWindowVisible && activeTab === 'cfg' && (
            <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[var(--accent-primary)] rounded-r" />
          )}
          <Network className="w-4 h-4" />
        </button>

        <div className="w-5 h-[1px] bg-[var(--border-color)] my-1" />

        {/* Run / Terminal (Alt+4) */}
        <button
          onClick={() => {
            if (activeTab === 'console' && isToolWindowVisible) {
              onToggleToolWindow();
            } else {
              onSelectTab('console');
              if (!isToolWindowVisible) onToggleToolWindow();
            }
          }}
          title="Run / Terminal (Alt+4)"
          className={`w-8 h-8 rounded-[4px] transition relative flex items-center justify-center ${
            isToolWindowVisible && activeTab === 'console'
              ? 'bg-[var(--bg-panel)] text-[var(--text-main)] shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]'
          }`}
        >
          {isToolWindowVisible && activeTab === 'console' && (
            <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[var(--accent-primary)] rounded-r" />
          )}
          <Terminal className="w-4 h-4" />
        </button>

        {/* Problems (Alt+6) */}
        <button
          onClick={() => {
            if (activeTab === 'problems' && isToolWindowVisible) {
              onToggleToolWindow();
            } else {
              onSelectTab('problems');
              if (!isToolWindowVisible) onToggleToolWindow();
            }
          }}
          title="Problems (Alt+6)"
          className={`w-8 h-8 rounded-[4px] transition relative flex items-center justify-center ${
            isToolWindowVisible && activeTab === 'problems'
              ? 'bg-[var(--bg-panel)] text-red-400 shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]'
          }`}
        >
          <AlertOctagon className="w-4 h-4" />
          {errorsCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-400" />
          )}
          {isToolWindowVisible && activeTab === 'problems' && (
            <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-red-400 rounded-r" />
          )}
        </button>
      </div>

      {/* Base: Quick Theme & Settings */}
      <div className="flex flex-col items-center gap-1 w-full">
        {/* Alternador Rápido de Tema */}
        <button
          onClick={() => {
            const themeCycle: typeof theme[] = ['jetbrains', 'arceus', 'void', 'dialga', 'giratina', 'arceus-light'];
            const idx = themeCycle.indexOf(theme);
            const next = themeCycle[(idx + 1) % themeCycle.length];
            setTheme(next);
          }}
          title={`Tema: ${themeConfig.name} (Clique para alternar rápido)`}
          className="w-8 h-8 rounded-[4px] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] transition flex items-center justify-center"
        >
          <Palette className="w-4 h-4 text-[var(--accent-primary)]" />
        </button>

        {/* Settings Dialog (Ctrl+,) */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          title="Settings (Ctrl+,)"
          className="w-8 h-8 rounded-[4px] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] transition flex items-center justify-center"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
