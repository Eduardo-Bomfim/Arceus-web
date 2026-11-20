import {
  FolderTree,
  Terminal,
  AlertOctagon,
  Palette,
  Command,
  Play,
  Square,
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
  onOpenCommandPalette,
  isRunning,
  onRun,
  onAbort,
  errorsCount,
}: ActivityBarProps) {
  const { themeConfig, setTheme, theme } = useTheme();

  return (
    <aside className="w-11 bg-[var(--bg-app)] border-r border-[var(--border-color)] flex flex-col items-center justify-between py-2 select-none shrink-0 z-10">
      {/* Topo: Ferramentas de Navegação e Execução */}
      <div className="flex flex-col items-center gap-1.5 w-full">
        {/* Botão Projeto (Alt+1) */}
        <button
          onClick={onToggleSidebar}
          title="Projeto / Arquivos (Alt+1)"
          className={`p-2 rounded-md transition relative flex items-center justify-center ${
            sidebarOpen
              ? 'bg-[var(--bg-active-tab)] text-white'
              : 'text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-surface)]'
          }`}
          style={sidebarOpen ? { color: themeConfig.primaryColor } : undefined}
        >
          <FolderTree className="w-4 h-4" />
          {sidebarOpen && (
            <div
              className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r"
              style={{ backgroundColor: themeConfig.primaryColor }}
            />
          )}
        </button>

        {/* Botão Executar Rápido */}
        {!isRunning ? (
          <button
            onClick={onRun}
            title="Executar Programa (F9)"
            className="p-2 rounded-md text-emerald-400 hover:bg-emerald-950/40 hover:text-emerald-300 transition"
          >
            <Play className="w-4 h-4 fill-current" />
          </button>
        ) : (
          <button
            onClick={onAbort}
            title="Parar Execução (Esc)"
            className="p-2 rounded-md text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition animate-pulse"
          >
            <Square className="w-4 h-4 fill-current" />
          </button>
        )}

        <div className="w-6 h-px bg-[var(--border-color)] my-1" />

        {/* Botão Console / Terminal (Alt+4) */}
        <button
          onClick={() => {
            if (activeTab === 'console' && isToolWindowVisible) {
              onToggleToolWindow();
            } else {
              onSelectTab('console');
              if (!isToolWindowVisible) onToggleToolWindow();
            }
          }}
          title="Terminal / Console (Alt+4)"
          className={`p-2 rounded-md transition relative ${
            isToolWindowVisible && activeTab === 'console'
              ? 'bg-[var(--bg-active-tab)] text-white'
              : 'text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-surface)]'
          }`}
          style={
            isToolWindowVisible && activeTab === 'console'
              ? { color: themeConfig.primaryColor }
              : undefined
          }
        >
          <Terminal className="w-4 h-4" />
          {isToolWindowVisible && activeTab === 'console' && (
            <div
              className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r"
              style={{ backgroundColor: themeConfig.primaryColor }}
            />
          )}
        </button>

        {/* Botão Problemas (Alt+6) */}
        <button
          onClick={() => {
            if (activeTab === 'problems' && isToolWindowVisible) {
              onToggleToolWindow();
            } else {
              onSelectTab('problems');
              if (!isToolWindowVisible) onToggleToolWindow();
            }
          }}
          title="Problemas & Diagnósticos (Alt+6)"
          className={`p-2 rounded-md transition relative ${
            isToolWindowVisible && activeTab === 'problems'
              ? 'bg-[var(--bg-active-tab)] text-rose-400'
              : 'text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-surface)]'
          }`}
        >
          <AlertOctagon className="w-4 h-4" />
          {errorsCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          )}
          {isToolWindowVisible && activeTab === 'problems' && (
            <div className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-rose-400 rounded-r" />
          )}
        </button>
      </div>

      {/* Base: Paleta de Comandos e Alternador de Tema */}
      <div className="flex flex-col items-center gap-1.5 w-full">
        {/* Paleta de Comandos */}
        <button
          onClick={onOpenCommandPalette}
          title="Paleta de Comandos (Ctrl+Shift+P ou Ctrl+K)"
          className="p-2 rounded-md text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-surface)] transition"
        >
          <Command className="w-4 h-4" />
        </button>

        {/* Alternador Rápido de Tema */}
        <button
          onClick={() => {
            const nextTheme =
              theme === 'arceus' ? 'void' : theme === 'void' ? 'dialga' : theme === 'dialga' ? 'giratina' : 'arceus';
            setTheme(nextTheme);
          }}
          title={`Tema: ${themeConfig.name} (Clique para alternar)`}
          className="p-2 rounded-md text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-surface)] transition relative group"
        >
          <Palette className="w-4 h-4" style={{ color: themeConfig.primaryColor }} />
        </button>
      </div>
    </aside>
  );
}
