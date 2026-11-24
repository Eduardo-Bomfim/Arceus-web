import { useState, useRef, useEffect, useCallback } from 'react';
import { Group, Panel, Separator } from 'react-resizable-panels';

import { CodeEditor } from './editor/CodeEditor';
import type { CodeEditorRef } from './editor/CodeEditor';
import { Topbar } from './components/Topbar';
import { Terminal } from './components/Terminal';
import { StatusBar } from './components/StatusBar';
import { EditorTabs } from './components/EditorTabs';
import { ProjectSidebar } from './components/ProjectSidebar';
import { ToolWindowHeader } from './components/ToolWindowHeader';
import { BottomToolStripe } from './components/BottomToolStripe';
import { CommandPalette } from './components/CommandPalette';
import { SettingsDrawer } from './components/SettingsDrawer';
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
import { checkHealth, runProgramHttp } from './api/client';
import { downloadFile, openLocalFile } from './utils/file-utils';
import { getSharedCode, generateShareUrl } from './utils/share';
import { formatMiniLangCode } from './editor/formatter';

function IdeWorkspace() {
  const { theme, isSettingsOpen, setIsSettingsOpen, settings, updateSettings } = useTheme();
  const { showToast } = useToast();
  const { activeTab, setActiveTab } = useTabs('console');
  const {
    files,
    activeFile,
    activeFileId,
    selectFile,
    updateContent,
    updateFileContentById,
    createFile,
    upsertFile,
    closeFile,
    renameFile,
    loadExternalFile,
  } = useFiles();

  const [panelPosition, setPanelPosition] = useState<'bottom' | 'right'>(() => {
    try {
      const saved = localStorage.getItem('arceus_panel_position');
      if (saved === 'right' || saved === 'bottom') return saved;
    } catch {
      // ignore
    }
    return 'bottom';
  });

  const [isToolWindowVisible, setIsToolWindowVisible] = useState(true);
  const [isToolWindowMaximized, setIsToolWindowMaximized] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  const optimize = settings.optimize;
  const editorRef = useRef<CodeEditorRef>(null);
  const debounceTimerRef = useRef<number | null>(null);
  const didCheckShareRef = useRef(false);
  const lastAnalyzedIdRef = useRef<string | null>(null);

  const {
    status,
    messages,
    waitingInput,
    errors,
    analysisData,
    isAnalyzing,
    health,
    appendMessage,
    runProgram,
    runAnalysis,
    sendStdin,
    abortExecution,
    clearConsole,
  } = useArceusRunner();

  const handleToggleOptimize = useCallback(
    (opt: boolean) => {
      updateSettings({ optimize: opt });
      if (activeFile) {
        void runAnalysis(activeFile.content, opt);
      }
    },
    [activeFile, runAnalysis, updateSettings]
  );

  // Carrega código compartilhado na URL uma única vez ao iniciar
  useEffect(() => {
    if (didCheckShareRef.current) return;
    didCheckShareRef.current = true;

    const shared = getSharedCode();
    if (shared) {
      loadExternalFile('compartilhado.ml', shared);
      showToast('Código compartilhado carregado com sucesso!', 'info');
      void runAnalysis(shared, optimize);
    }
  }, [loadExternalFile, optimize, runAnalysis, showToast]);

  // Análise estática inicial quando o arquivo ativo muda
  useEffect(() => {
    if (!activeFile?.content) return;
    if (lastAnalyzedIdRef.current === activeFileId) return;
    lastAnalyzedIdRef.current = activeFileId;
    void runAnalysis(activeFile.content, optimize);
  }, [activeFileId, activeFile, optimize, runAnalysis]);

  const handleCodeChange = (newCode: string) => {
    updateContent(newCode);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (!settings.autoAnalyze) return;

    debounceTimerRef.current = window.setTimeout(() => {
      void runAnalysis(newCode, optimize);
    }, settings.analyzeDelay);
  };

  // Executa o arquivo ativo no Terminal Interativo
  const handleRun = useCallback(() => {
    if (!activeFile) return;
    setActiveTab('console');
    setIsToolWindowVisible(true);
    void runProgram(activeFile.content, optimize, {
      clear: settings.clearBeforeRun,
      commandLabel: `arceus run ${activeFile.name}${optimize ? ' --opt' : ''}`,
      maxSteps: settings.maxSteps,
      fileName: activeFile.name,
    });
  }, [
    activeFile,
    optimize,
    runProgram,
    setActiveTab,
    settings.clearBeforeRun,
    settings.maxSteps,
  ]);

  // Execução acionada diretamente via comandos do Terminal
  const handleTerminalRunFile = useCallback(
    async (source: string, opt: boolean, fileName: string) => {
      await runProgram(source, opt, {
        clear: false,
        maxSteps: settings.maxSteps,
        fileName,
      });
    },
    [runProgram, settings.maxSteps]
  );

  const handleAnalyze = useCallback(async () => {
    if (!activeFile) return;
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    const res = await runAnalysis(activeFile.content, optimize);
    if (res && res.errors.length > 0) {
      setActiveTab('problems');
    } else {
      setActiveTab('ast');
    }
    setIsToolWindowVisible(true);
  }, [activeFile, optimize, runAnalysis, setActiveTab]);

  const handleSelectExample = useCallback(
    (exampleCode: string, exampleTitle?: string) => {
      createFile(
        exampleTitle
          ? `${exampleTitle.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')}.ml`
          : undefined,
        exampleCode
      );
      void runAnalysis(exampleCode, optimize);
      showToast('Exemplo carregado em nova aba.', 'info');
    },
    [createFile, optimize, runAnalysis, showToast]
  );

  const handleOpenFile = useCallback(() => {
    openLocalFile((content, filename) => {
      createFile(filename || 'arquivo.ml', content);
      void runAnalysis(content, optimize);
      showToast(`Arquivo "${filename || 'arquivo.ml'}" aberto.`, 'success');
    });
  }, [createFile, optimize, runAnalysis, showToast]);

  const handleDownloadFile = useCallback(() => {
    if (!activeFile) return;
    downloadFile(activeFile.name, activeFile.content);
    showToast(`Arquivo "${activeFile.name}" baixado.`, 'success');
  }, [activeFile, showToast]);

  const handleShare = useCallback(() => {
    if (!activeFile) return;
    const url = generateShareUrl(activeFile.content);
    navigator.clipboard
      .writeText(url)
      .then(() => {
        showToast('Link de compartilhamento copiado.', 'success');
      })
      .catch(() => {
        showToast('Erro ao copiar link de compartilhamento.', 'error');
      });
  }, [activeFile, showToast]);

  const handleCopyCode = useCallback(() => {
    if (!activeFile) return;
    navigator.clipboard
      .writeText(activeFile.content)
      .then(() => {
        showToast('Código copiado para a área de transferência.', 'success');
      })
      .catch(() => {
        showToast('Erro ao copiar código.', 'error');
      });
  }, [activeFile, showToast]);

  const handleSave = useCallback(() => {
    showToast('Alterações salvas automaticamente no navegador.', 'info');
  }, [showToast]);

  const handleFormatCode = useCallback(() => {
    if (!activeFile) return;
    const formatted = formatMiniLangCode(activeFile.content);
    if (formatted !== activeFile.content) {
      updateContent(formatted);
      void runAnalysis(formatted, optimize);
      showToast('Código formatado com sucesso.', 'success');
    } else {
      showToast('O código já está formatado.', 'info');
    }
  }, [activeFile, updateContent, runAnalysis, optimize, showToast]);

  const handleSelectError = useCallback((line: number, column?: number) => {
    editorRef.current?.goToLine(line, column);
  }, []);

  const handleTogglePanelPosition = useCallback(() => {
    const next = panelPosition === 'bottom' ? 'right' : 'bottom';
    setPanelPosition(next);
    try {
      localStorage.setItem('arceus_panel_position', next);
    } catch {
      // ignore
    }
    showToast(
      next === 'bottom'
        ? 'Painel movido para a parte inferior.'
        : 'Painel movido para a lateral direita.',
      'info'
    );
  }, [panelPosition, showToast]);

  // Atalhos globais de teclado
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === '1') {
        e.preventDefault();
        setSidebarOpen((prev) => !prev);
      } else if (e.altKey && e.key === '4') {
        e.preventDefault();
        if (activeTab === 'console' && isToolWindowVisible) {
          setIsToolWindowVisible(false);
        } else {
          setActiveTab('console');
          setIsToolWindowVisible(true);
        }
      } else if (e.altKey && e.key === '6') {
        e.preventDefault();
        if (activeTab === 'problems' && isToolWindowVisible) {
          setIsToolWindowVisible(false);
        } else {
          setActiveTab('problems');
          setIsToolWindowVisible(true);
        }
      } else if (
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'p') ||
        (e.ctrlKey && e.key.toLowerCase() === 'k')
      ) {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
      } else if (e.ctrlKey && e.key === ',') {
        e.preventDefault();
        setIsSettingsOpen(!isSettingsOpen);
      } else if (e.shiftKey && e.altKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        handleFormatCode();
      } else if (e.key === 'F9' || (e.ctrlKey && e.key === 'Enter')) {
        e.preventDefault();
        handleRun();
      } else if (e.ctrlKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      } else if (e.ctrlKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        clearConsole();
      } else if (e.key === 'Escape') {
        if (isPaletteOpen) {
          setIsPaletteOpen(false);
        } else if (isSettingsOpen) {
          setIsSettingsOpen(false);
        } else if (status === 'RUNNING' || status === 'WAITING_INPUT') {
          abortExecution();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [
    handleRun,
    handleFormatCode,
    handleSave,
    status,
    abortExecution,
    isPaletteOpen,
    isSettingsOpen,
    setIsSettingsOpen,
    clearConsole,
    activeTab,
    isToolWindowVisible,
    setActiveTab,
  ]);

  const activeContent = activeFile?.content ?? '';
  const lineCount = activeContent.split('\n').length;

  const sidebarElement = sidebarOpen && (
    <ProjectSidebar
      files={files}
      activeFileId={activeFileId}
      onSelectFile={selectFile}
      onCreateFile={() => createFile()}
      onCloseFile={closeFile}
      onRenameFile={renameFile}
      onSelectExample={handleSelectExample}
      onOpenFile={handleOpenFile}
      onCollapse={() => setSidebarOpen(false)}
    />
  );

  const editorIsland = (
    <div className="flex flex-col h-full w-full overflow-hidden bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--ui-radius-lg)] transition-colors">
      <EditorTabs
        files={files}
        activeFileId={activeFileId}
        onSelectFile={selectFile}
        onCreateFile={() => createFile()}
        onCloseFile={closeFile}
        onRenameFile={renameFile}
        onCopyCode={handleCopyCode}
        onFormatCode={handleFormatCode}
        onDownloadFile={handleDownloadFile}
        cursorLine={cursorPos.line}
        onNavigateToLine={(line) => editorRef.current?.goToLine(line)}
      />

      <div className="flex-1 h-full overflow-hidden bg-[var(--bg-surface)] flex flex-col">
        <CodeEditor
          ref={editorRef}
          value={activeContent}
          onChange={handleCodeChange}
          errors={errors}
          symbols={analysisData?.symbol_table ?? []}
          onRunShortcut={handleRun}
          onFormatShortcut={handleFormatCode}
          theme={theme}
          onCursorChange={(line, col) => setCursorPos({ line, col })}
        />
      </div>
    </div>
  );

  const toolsIsland = (
    <div className="flex flex-col h-full w-full overflow-hidden bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--ui-radius-lg)] transition-colors">
      <ToolWindowHeader
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === activeTab && isToolWindowVisible) {
            setIsToolWindowVisible(false);
          } else {
            setActiveTab(tab);
          }
        }}
        errorsCount={errors.length}
        tokensCount={analysisData?.tokens?.length}
        panelPosition={panelPosition}
        onTogglePanelPosition={handleTogglePanelPosition}
        isMaximized={isToolWindowMaximized}
        onToggleMaximize={() => setIsToolWindowMaximized((prev) => !prev)}
        onClose={() => setIsToolWindowVisible(false)}
      />

      <div className="flex-1 overflow-hidden bg-[var(--bg-surface)]">
        {activeTab === 'console' && (
          <Terminal
            messages={messages}
            status={status}
            waitingInput={waitingInput}
            onSendStdin={sendStdin}
            onClear={clearConsole}
            onAbort={abortExecution}
            onAppendMessage={appendMessage}
            files={files}
            activeFile={activeFile}
            selectFile={selectFile}
            createFile={createFile}
            upsertFile={upsertFile}
            closeFile={closeFile}
            renameFile={renameFile}
            updateFileContentById={updateFileContentById}
            optimize={optimize}
            onRunFile={handleTerminalRunFile}
            onAnalyzeSource={runAnalysis}
            onRunHttp={(src, opt) => runProgramHttp(src, [], opt, undefined, settings.maxSteps)}
            onCheckHealth={checkHealth}
            onFormatSource={formatMiniLangCode}
            onShare={handleShare}
            onGoToLine={handleSelectError}
            onSwitchTab={(tab) => {
              setActiveTab(tab);
              setIsToolWindowVisible(true);
            }}
          />
        )}

        {activeTab === 'problems' && (
          <DiagnosticsPanel errors={errors} onSelectError={handleSelectError} />
        )}

        {activeTab === 'ast' && (
          <AstPanel
            rawAst={analysisData?.ast_raw ?? null}
            optimizedAst={analysisData?.ast_optimized ?? null}
            optimizeEnabled={optimize}
            isLoading={isAnalyzing}
            onSelectLine={(line) => editorRef.current?.goToLine(line)}
          />
        )}

        {activeTab === 'cfg' && (
          <CfgPanel
            sourceCode={activeContent}
            astRaw={analysisData?.ast_optimized ?? analysisData?.ast_raw ?? null}
            isLoading={isAnalyzing}
            activeLine={cursorPos.line}
            onNodeClick={(startLine) => editorRef.current?.goToLine(startLine)}
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
    </div>
  );

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[var(--bg-app)] text-[var(--text-main)] transition-colors">
      {/* Barra Superior Limpa */}
      <Topbar
        status={status}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        onRun={handleRun}
        onAbort={abortExecution}
        onAnalyze={handleAnalyze}
        onSelectExample={handleSelectExample}
        onShare={handleShare}
        onOpenCommandPalette={() => setIsPaletteOpen(true)}
        health={health}
        isAnalyzing={isAnalyzing}
      />

      {/* Área Principal em Ilhas */}
      <div
        className="flex-1 flex overflow-hidden px-2 pb-1.5"
        style={{ gap: 'var(--ui-gap)' }}
      >
        {settings.sidebarPosition === 'left' && sidebarElement}

        <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
          {isToolWindowVisible ? (
            <Group
              key={panelPosition}
              orientation={panelPosition === 'bottom' ? 'vertical' : 'horizontal'}
              id={`arceus-ide-split-${panelPosition}`}
              defaultLayout={
                isToolWindowMaximized
                  ? { 'editor-pane': 20, 'tabs-pane': 80 }
                  : panelPosition === 'bottom'
                  ? { 'editor-pane': 62, 'tabs-pane': 38 }
                  : { 'editor-pane': 55, 'tabs-pane': 45 }
              }
              className="flex-1 overflow-hidden"
            >
              <Panel id="editor-pane" minSize={18} className="flex flex-col h-full overflow-hidden">
                {editorIsland}
              </Panel>

              <Separator
                className={
                  panelPosition === 'bottom'
                    ? 'h-1.5 w-full flex items-center justify-center cursor-row-resize group shrink-0'
                    : 'w-1.5 h-full flex items-center justify-center cursor-col-resize group shrink-0'
                }
              >
                <div
                  className={
                    panelPosition === 'bottom'
                      ? 'w-10 h-0.5 rounded-full bg-[var(--border-color)] group-hover:bg-[var(--accent-primary)] transition-colors'
                      : 'h-10 w-0.5 rounded-full bg-[var(--border-color)] group-hover:bg-[var(--accent-primary)] transition-colors'
                  }
                />
              </Separator>

              <Panel id="tabs-pane" minSize={18} className="flex flex-col h-full overflow-hidden">
                {toolsIsland}
              </Panel>
            </Group>
          ) : (
            <div
              className="flex-1 flex flex-col h-full overflow-hidden"
              style={{ gap: 'var(--ui-gap)' }}
            >
              <div className="flex-1 overflow-hidden">{editorIsland}</div>

              <BottomToolStripe
                activeTab={activeTab}
                onOpenTab={(tab) => {
                  setActiveTab(tab);
                  setIsToolWindowVisible(true);
                }}
                errorsCount={errors.length}
              />
            </div>
          )}
        </div>

        {settings.sidebarPosition === 'right' && sidebarElement}
      </div>

      {/* Barra de Status Discreta (opcional nas Configurações) */}
      <StatusBar
        cursorLine={cursorPos.line}
        cursorCol={cursorPos.col}
        lineCount={lineCount}
        errorsCount={errors.length}
        isPanelOpen={isToolWindowVisible}
        onTogglePanel={() => setIsToolWindowVisible((prev) => !prev)}
        onOpenProblems={() => {
          setActiveTab('problems');
          setIsToolWindowVisible(true);
        }}
      />

      {/* Paleta de Comandos */}
      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        files={files}
        activeFileId={activeFileId}
        onSelectFile={selectFile}
        onRun={handleRun}
        onAbort={abortExecution}
        onAnalyze={handleAnalyze}
        onShare={handleShare}
        onDownload={handleDownloadFile}
        onOpenFile={handleOpenFile}
        onClearTerminal={clearConsole}
        onCreateFile={() => createFile()}
        onFormatCode={handleFormatCode}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        onToggleOptimize={() => handleToggleOptimize(!optimize)}
        optimize={optimize}
        onSelectExample={handleSelectExample}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setIsToolWindowVisible(true);
        }}
      />

      {/* Configurações */}
      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        optimize={optimize}
        onToggleOptimize={handleToggleOptimize}
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
