import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Terminal as TerminalIcon,
  AlertOctagon,
  GitCompare,
  Database,
  Binary,
  Network,
} from 'lucide-react';
import { Group, Panel, Separator } from 'react-resizable-panels';

import { CodeEditor } from './editor/CodeEditor';
import type { CodeEditorRef } from './editor/CodeEditor';
import { Topbar } from './components/Topbar';
import { Terminal } from './components/Terminal';
import { StatusBar } from './components/StatusBar';
import { EditorTabs } from './components/EditorTabs';
import { CommandPalette } from './components/CommandPalette';
import { AstPanel } from './components/panels/AstPanel';
import { SymbolTablePanel } from './components/panels/SymbolTablePanel';
import { TokensPanel } from './components/panels/TokensPanel';
import { DiagnosticsPanel } from './components/panels/DiagnosticsPanel';
import { CfgPanel } from './components/panels/CfgPanel';

import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { useArceusRunner } from './hooks/useArceusRunner';
import { useTabs } from './hooks/useTabs';
import { useFiles } from './hooks/useFiles';
import { downloadFile, openLocalFile } from './utils/file-utils';
import { getSharedCode, generateShareUrl } from './utils/share';

function IdeWorkspace() {
  const { theme, themeConfig } = useTheme();
  const { showToast } = useToast();
  const { activeTab, setActiveTab } = useTabs('console');
  const {
    files,
    activeFile,
    activeFileId,
    selectFile,
    updateContent,
    createFile,
    closeFile,
    renameFile,
    loadExternalFile,
  } = useFiles();

  const [optimize, setOptimize] = useState(false);
  const [showMinimap, setShowMinimap] = useState(true);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  const editorRef = useRef<CodeEditorRef>(null);
  const debounceTimerRef = useRef<number | null>(null);

  const {
    status,
    messages,
    waitingInput,
    errors,
    exitCode,
    durationMs,
    analysisData,
    isAnalyzing,
    health,
    runProgram,
    runAnalysis,
    sendStdin,
    abortExecution,
    clearConsole,
  } = useArceusRunner();

  // Detect shared code in URL on load
  useEffect(() => {
    const shared = getSharedCode();
    if (shared) {
      loadExternalFile('compartilhado.ml', shared);
      showToast('Código compartilhado carregado com sucesso!', 'info');
      runAnalysis(shared, optimize);
    }
  }, []);

  // Run initial analysis on current active file
  useEffect(() => {
    if (activeFile?.content) {
      runAnalysis(activeFile.content, optimize);
    }
  }, [activeFileId]);

  // Code change with debounced analysis
  const handleCodeChange = (newCode: string) => {
    updateContent(newCode);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = window.setTimeout(() => {
      runAnalysis(newCode, optimize);
    }, 400);
  };

  // Run execution
  const handleRun = useCallback(() => {
    if (!activeFile) return;
    setActiveTab('console');
    runProgram(activeFile.content, optimize);
  }, [activeFile, optimize, runProgram, setActiveTab]);

  // Run static analysis immediately
  const handleAnalyze = useCallback(async () => {
    if (!activeFile) return;
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    const res = await runAnalysis(activeFile.content, optimize);
    if (res && res.errors.length > 0) {
      setActiveTab('problems');
    } else {
      setActiveTab('ast');
    }
  }, [activeFile, optimize, runAnalysis, setActiveTab]);

  // Select example
  const handleSelectExample = (exampleCode: string, exampleTitle?: string) => {
    createFile(
      exampleTitle ? `${exampleTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}.ml` : undefined,
      exampleCode
    );
    runAnalysis(exampleCode, optimize);
    showToast('Exemplo carregado em nova aba!', 'info');
  };

  // Open local file
  const handleOpenFile = () => {
    openLocalFile((content, filename) => {
      createFile(filename || 'arquivo.ml', content);
      runAnalysis(content, optimize);
      showToast(`Arquivo "${filename || 'arquivo.ml'}" aberto com sucesso!`, 'success');
    });
  };

  // Download file
  const handleDownloadFile = () => {
    if (!activeFile) return;
    downloadFile(activeFile.name, activeFile.content);
    showToast(`Arquivo "${activeFile.name}" baixado!`, 'success');
  };

  // Share file via URL
  const handleShare = () => {
    if (!activeFile) return;
    const url = generateShareUrl(activeFile.content);
    navigator.clipboard
      .writeText(url)
      .then(() => {
        showToast('Link de compartilhamento copiado para a área de transferência!', 'success');
      })
      .catch(() => {
        showToast('Erro ao copiar link para o clipboard.', 'error');
      });
  };

  // Copy code to clipboard
  const handleCopyCode = () => {
    if (!activeFile) return;
    navigator.clipboard
      .writeText(activeFile.content)
      .then(() => {
        showToast('Código copiado para a área de transferência!', 'success');
      })
      .catch(() => {
        showToast('Erro ao copiar código.', 'error');
      });
  };

  // Save shortcut (Ctrl+S)
  const handleSave = () => {
    showToast('Todas as alterações foram salvas automaticamente!', 'info');
  };

  // Select error in editor
  const handleSelectError = (line: number, column?: number) => {
    editorRef.current?.goToLine(line, column);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Command palette: Ctrl+Shift+P or Ctrl+K
      if (
        (e.ctrlKey && e.shiftKey && (e.key === 'P' || e.key === 'p')) ||
        (e.ctrlKey && (e.key === 'k' || e.key === 'K'))
      ) {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
      } else if (e.key === 'F9' || (e.ctrlKey && e.key === 'Enter')) {
        e.preventDefault();
        handleRun();
      } else if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        handleSave();
      } else if (e.ctrlKey && (e.key === 'l' || e.key === 'L')) {
        e.preventDefault();
        clearConsole();
      } else if (e.key === 'Escape') {
        if (isPaletteOpen) {
          setIsPaletteOpen(false);
        } else if (status === 'RUNNING' || status === 'WAITING_INPUT') {
          abortExecution();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleRun, status, abortExecution, isPaletteOpen, clearConsole]);

  const activeContent = activeFile?.content ?? '';
  const lineCount = activeContent.split('\n').length;
  const charCount = activeContent.length;

  // Restore layout saved from localStorage
  const savedLayout = (() => {
    try {
      const item = localStorage.getItem('arceus_panel_layout');
      return item ? JSON.parse(item) : { 'editor-pane': 50, 'tabs-pane': 50 };
    } catch {
      return { 'editor-pane': 50, 'tabs-pane': 50 };
    }
  })();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[var(--bg-app)] text-[var(--text-main)] transition-colors">
      <Topbar
        status={status}
        optimize={optimize}
        onToggleOptimize={(opt) => {
          setOptimize(opt);
          if (activeFile) runAnalysis(activeFile.content, opt);
        }}
        onRun={handleRun}
        onAbort={abortExecution}
        onAnalyze={handleAnalyze}
        onSelectExample={(code) => handleSelectExample(code)}
        onOpenFile={handleOpenFile}
        onDownloadFile={handleDownloadFile}
        onShare={handleShare}
        onOpenCommandPalette={() => setIsPaletteOpen(true)}
        health={health}
        isAnalyzing={isAnalyzing}
      />

      {/* Main Resizable Splitter Area */}
      <Group
        orientation="horizontal"
        id="arceus-ide-split"
        defaultLayout={savedLayout}
        onLayoutChanged={(layout) => {
          try {
            localStorage.setItem('arceus_panel_layout', JSON.stringify(layout));
          } catch {
            // ignore
          }
        }}
        className="flex-1 overflow-hidden"
      >
        {/* Painel Esquerdo: Abas de Arquivos + Editor MiniLang */}
        <Panel id="editor-pane" minSize={25} className="flex flex-col h-full overflow-hidden bg-[var(--bg-surface)]">
          <EditorTabs
            files={files}
            activeFileId={activeFileId}
            onSelectFile={selectFile}
            onCreateFile={() => createFile()}
            onCloseFile={closeFile}
            onRenameFile={renameFile}
            onCopyCode={handleCopyCode}
            showMinimap={showMinimap}
            onToggleMinimap={() => setShowMinimap((prev) => !prev)}
          />

          <div className="flex-1 overflow-hidden">
            <CodeEditor
              ref={editorRef}
              value={activeContent}
              onChange={handleCodeChange}
              errors={errors}
              onRunShortcut={handleRun}
              theme={theme}
              onCursorChange={(line, col) => setCursorPos({ line, col })}
              showMinimap={showMinimap}
            />
          </div>
        </Panel>

        {/* Barra de Redimensionamento */}
        <Separator className="w-1.5 bg-[var(--border-color)] hover:bg-amber-400/50 transition-colors cursor-col-resize active:bg-amber-400" />

        {/* Painel Direito: Abas de Execução e Inspeção */}
        <Panel id="tabs-pane" minSize={25} className="flex flex-col h-full overflow-hidden bg-[var(--bg-panel)]">
          {/* Navegação de Abas */}
          <div className="flex items-center bg-[var(--bg-header)] border-b border-[var(--border-color)] px-2 select-none overflow-x-auto text-xs no-scrollbar">
            <button
              onClick={() => setActiveTab('console')}
              className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition ${
                activeTab === 'console'
                  ? 'bg-[var(--bg-active-tab)] text-white'
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)]'
              }`}
              style={
                activeTab === 'console'
                  ? { borderBottomColor: themeConfig.primaryColor, color: themeConfig.primaryColor }
                  : undefined
              }
            >
              <TerminalIcon className="w-3.5 h-3.5" />
              <span>Console</span>
            </button>

            <button
              onClick={() => setActiveTab('problems')}
              className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition ${
                activeTab === 'problems'
                  ? 'border-rose-400 text-rose-400 bg-[var(--bg-active-tab)]'
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)]'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Problemas</span>
              {errors.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-950 text-rose-300 font-bold border border-rose-800/40">
                  {errors.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('ast')}
              className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition ${
                activeTab === 'ast'
                  ? 'bg-[var(--bg-active-tab)] text-white'
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)]'
              }`}
              style={
                activeTab === 'ast'
                  ? { borderBottomColor: themeConfig.secondaryColor, color: themeConfig.secondaryColor }
                  : undefined
              }
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>AST (Árvore)</span>
            </button>

            <button
              onClick={() => setActiveTab('cfg')}
              className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition ${
                activeTab === 'cfg'
                  ? 'bg-[var(--bg-active-tab)] text-white'
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)]'
              }`}
              style={
                activeTab === 'cfg'
                  ? { borderBottomColor: themeConfig.primaryColor, color: themeConfig.primaryColor }
                  : undefined
              }
            >
              <Network className="w-3.5 h-3.5" />
              <span>CFG (Fluxo)</span>
            </button>

            <button
              onClick={() => setActiveTab('symbols')}
              className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition ${
                activeTab === 'symbols'
                  ? 'bg-[var(--bg-active-tab)] text-white'
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)]'
              }`}
              style={
                activeTab === 'symbols'
                  ? { borderBottomColor: themeConfig.primaryColor, color: themeConfig.primaryColor }
                  : undefined
              }
            >
              <Database className="w-3.5 h-3.5" />
              <span>Símbolos</span>
            </button>

            <button
              onClick={() => setActiveTab('tokens')}
              className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition ${
                activeTab === 'tokens'
                  ? 'bg-[var(--bg-active-tab)] text-white'
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)]'
              }`}
              style={
                activeTab === 'tokens'
                  ? { borderBottomColor: themeConfig.secondaryColor, color: themeConfig.secondaryColor }
                  : undefined
              }
            >
              <Binary className="w-3.5 h-3.5" />
              <span>Tokens</span>
              {analysisData?.tokens && analysisData.tokens.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-sky-950 text-sky-300 font-semibold border border-sky-800/40">
                  {analysisData.tokens.length}
                </span>
              )}
            </button>
          </div>

          {/* Conteúdo da Aba Ativa */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'console' && (
              <Terminal
                messages={messages}
                status={status}
                waitingInput={waitingInput}
                exitCode={exitCode}
                durationMs={durationMs}
                onSendStdin={sendStdin}
                onClear={clearConsole}
                onAbort={abortExecution}
              />
            )}

            {activeTab === 'problems' && (
              <DiagnosticsPanel
                errors={errors}
                onSelectError={handleSelectError}
              />
            )}

            {activeTab === 'ast' && (
              <AstPanel
                rawAst={analysisData?.ast_raw ?? null}
                optimizedAst={analysisData?.ast_optimized ?? null}
                optimizeEnabled={optimize}
                isLoading={isAnalyzing}
              />
            )}

            {activeTab === 'cfg' && (
              <CfgPanel
                sourceCode={activeContent}
                astRaw={analysisData?.ast_optimized ?? analysisData?.ast_raw ?? null}
                isLoading={isAnalyzing}
              />
            )}

            {activeTab === 'symbols' && (
              <SymbolTablePanel
                symbols={analysisData?.symbol_table ?? []}
                isLoading={isAnalyzing}
              />
            )}

            {activeTab === 'tokens' && (
              <TokensPanel
                tokens={analysisData?.tokens ?? []}
                isLoading={isAnalyzing}
              />
            )}
          </div>
        </Panel>
      </Group>

      {/* Barra de Status Inferior */}
      <StatusBar
        cursorLine={cursorPos.line}
        cursorCol={cursorPos.col}
        charCount={charCount}
        lineCount={lineCount}
        health={health}
        errorsCount={errors.length}
      />

      {/* Paleta de Comandos */}
      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        onRun={handleRun}
        onAbort={abortExecution}
        onAnalyze={handleAnalyze}
        onShare={handleShare}
        onDownload={handleDownloadFile}
        onOpenFile={handleOpenFile}
        onClearTerminal={clearConsole}
        onCreateFile={() => createFile()}
        onSelectExample={(code) => handleSelectExample(code)}
        onSelectTab={(tab) => setActiveTab(tab)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <IdeWorkspace />
      </ToastProvider>
    </ThemeProvider>
  );
}
