import {
  FolderTree,
  Terminal,
  AlertOctagon,
  Palette,
  Settings,
  GitBranch,
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
    <aside className="w-10 bg-[#1e1f22] border-r border-[#393b40] flex flex-col items-center justify-between py-1.5 select-none shrink-0 z-20">
      {/* Topo: Tool Windows Primárias do JetBrains */}
      <div className="flex flex-col items-center gap-1 w-full">
        {/* Project Tool Window (Alt+1) */}
        <button
          onClick={onToggleSidebar}
          title="Project (Alt+1)"
          className={`w-8 h-8 rounded-[4px] transition relative flex items-center justify-center ${
            sidebarOpen
              ? 'bg-[#2b2d30] text-[#dfe1e5]'
              : 'text-[#868a91] hover:text-[#dfe1e5] hover:bg-[#2b2d30]/60'
          }`}
        >
          {sidebarOpen && (
            <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[#3574f0] rounded-r" />
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
              ? 'bg-[#2b2d30] text-[#dfe1e5]'
              : 'text-[#868a91] hover:text-[#dfe1e5] hover:bg-[#2b2d30]/60'
          }`}
        >
          {isToolWindowVisible && activeTab === 'symbols' && (
            <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[#3574f0] rounded-r" />
          )}
          <ListTree className="w-4 h-4" />
        </button>

        {/* Version Control / Git */}
        <button
          onClick={() => {
            onSelectTab('ast');
            if (!isToolWindowVisible) onToggleToolWindow();
          }}
          title="Compiler AST Inspector"
          className={`w-8 h-8 rounded-[4px] transition relative flex items-center justify-center ${
            isToolWindowVisible && activeTab === 'ast'
              ? 'bg-[#2b2d30] text-[#dfe1e5]'
              : 'text-[#868a91] hover:text-[#dfe1e5] hover:bg-[#2b2d30]/60'
          }`}
        >
          {isToolWindowVisible && activeTab === 'ast' && (
            <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[#3574f0] rounded-r" />
          )}
          <GitBranch className="w-4 h-4" />
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
              ? 'bg-[#2b2d30] text-[#dfe1e5]'
              : 'text-[#868a91] hover:text-[#dfe1e5] hover:bg-[#2b2d30]/60'
          }`}
        >
          {isToolWindowVisible && activeTab === 'cfg' && (
            <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[#3574f0] rounded-r" />
          )}
          <Network className="w-4 h-4" />
        </button>

        <div className="w-5 h-[1px] bg-[#393b40] my-1" />

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
              ? 'bg-[#2b2d30] text-[#dfe1e5]'
              : 'text-[#868a91] hover:text-[#dfe1e5] hover:bg-[#2b2d30]/60'
          }`}
        >
          {isToolWindowVisible && activeTab === 'console' && (
            <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[#3574f0] rounded-r" />
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
              ? 'bg-[#2b2d30] text-[#f75464]'
              : 'text-[#868a91] hover:text-[#dfe1e5] hover:bg-[#2b2d30]/60'
          }`}
        >
          <AlertOctagon className="w-4 h-4" />
          {errorsCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#f75464]" />
          )}
          {isToolWindowVisible && activeTab === 'problems' && (
            <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[#f75464] rounded-r" />
          )}
        </button>
      </div>

      {/* Base: Quick Theme & Settings */}
      <div className="flex flex-col items-center gap-1 w-full">
        {/* Alternador Rápido de Tema */}
        <button
          onClick={() => {
            const themeCycle: typeof theme[] = ['jetbrains', 'arceus', 'void', 'dialga', 'giratina'];
            const idx = themeCycle.indexOf(theme);
            const next = themeCycle[(idx + 1) % themeCycle.length];
            setTheme(next);
          }}
          title={`Tema: ${themeConfig.name} (Clique para alternar rápido)`}
          className="w-8 h-8 rounded-[4px] text-[#868a91] hover:text-[#dfe1e5] hover:bg-[#2b2d30] transition flex items-center justify-center"
        >
          <Palette className="w-4 h-4 text-[#3574f0]" />
        </button>

        {/* Settings Dialog (Ctrl+,) */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          title="Settings (Ctrl+,)"
          className="w-8 h-8 rounded-[4px] text-[#868a91] hover:text-[#dfe1e5] hover:bg-[#2b2d30] transition flex items-center justify-center"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
