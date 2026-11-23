import { useState, useRef, useEffect, useCallback } from 'react';
import { Group, Panel, Separator } from 'react-resizable-panels';

import { CodeEditor } from './editor/CodeEditor';
import type { CodeEditorRef } from './editor/CodeEditor';
import { Topbar } from './components/Topbar';
import { Terminal } from './components/Terminal';
import { StatusBar } from './components/StatusBar';
import { EditorTabs } from './components/EditorTabs';
import { ActivityBar } from './components/ActivityBar';
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
    createFile,
    closeFile,
    renameFile,
    loadExternalFile,
  } = useFiles();

  // Layout states estilo IntelliJ IDEA
  const [panelPosition, setPanelPosition] = useState<'bottom' | 'right'>(() => {
    try {
      const saved = localStorage.getItem('arceus_panel_position');
      if (saved === 'right' || saved === 'bottom') return saved;
    } catch {
      // ignore
    }
    return 'bottom'; // Padrão: console/problemas na parte inferior do arquivo
  });

  const [isToolWindowVisible, setIsToolWindowVisible] = useState(true);
  const [isToolWindowMaximized, setIsToolWindowMaximized] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const optimize = settings.optimize;
  const handleToggleOptimize = (opt: boolean) => {
    updateSettings({ optimize: opt });
    if (activeFile) {
      runAnalysis(activeFile.content, opt);
    }
  };
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
    setIsToolWindowVisible(true);
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
    setIsToolWindowVisible(true);
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

  // Format code (Shift+Alt+F)
  const handleFormatCode = useCallback(() => {
    if (!activeFile) return;
    const formatted = formatMiniLangCode(activeFile.content);
    if (formatted !== activeFile.content) {
      updateContent(formatted);
      runAnalysis(formatted, optimize);
      showToast('Código formatado com sucesso! (2 espaços)', 'success');
    } else {
      showToast('O código já está perfeitamente formatado.', 'info');
    }
  }, [activeFile, updateContent, runAnalysis, optimize, showToast]);

  // Select error in editor
  const handleSelectError = (line: number, column?: number) => {
    editorRef.current?.goToLine(line, column);
  };

  // Alternador de Posição do Painel (Abaixo vs Direita)
  const handleTogglePanelPosition = () => {
    const next = panelPosition === 'bottom' ? 'right' : 'bottom';
    setPanelPosition(next);
    try {
      localStorage.setItem('arceus_panel_position', next);
    } catch {
      // ignore
    }
    showToast(
      next === 'bottom'
        ? 'Painel reposicionado na parte inferior (abaixo do editor)'
        : 'Painel reposicionado na lateral direita',
      'info'
    );
  };

  // Atalhos de teclado globais estilo IntelliJ IDEA
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Alt+1: Alternar painel de Projeto
      if (e.altKey && e.key === '1') {
        e.preventDefault();
        setSidebarOpen((prev) => !prev);
      }
      // Alt+4: Alternar Terminal / Console
      else if (e.altKey && e.key === '4') {
        e.preventDefault();
        if (activeTab === 'console' && isToolWindowVisible) {
          setIsToolWindowVisible(false);
        } else {
          setActiveTab('console');
          setIsToolWindowVisible(true);
        }
      }
      // Alt+6: Alternar Problemas
      else if (e.altKey && e.key === '6') {
        e.preventDefault();
        if (activeTab === 'problems' && isToolWindowVisible) {
          setIsToolWindowVisible(false);
        } else {
          setActiveTab('problems');
          setIsToolWindowVisible(true);
        }
      }
      // Paleta de Comandos: Ctrl+Shift+P ou Ctrl+K
      else if (
        (e.ctrlKey && e.shiftKey && (e.key === 'P' || e.key === 'p')) ||
        (e.ctrlKey && (e.key === 'k' || e.key === 'K'))
      ) {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
      }
      // Configurações: Ctrl+,
      else if (e.ctrlKey && e.key === ',') {
        e.preventDefault();
        setIsSettingsOpen(!isSettingsOpen);
      }
      // Formatar Código: Shift+Alt+F
      else if (e.shiftKey && e.altKey && (e.key === 'F' || e.key === 'f')) {
        e.preventDefault();
        handleFormatCode();
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
        } else if (isSettingsOpen) {
          setIsSettingsOpen(false);
        } else if (status === 'RUNNING' || status === 'WAITING_INPUT') {
          abortExecution();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleRun, handleFormatCode, status, abortExecution, isPaletteOpen, isSettingsOpen, setIsSettingsOpen, clearConsole, activeTab, isToolWindowVisible, setActiveTab]);

  const activeContent = activeFile?.content ?? '';
  const lineCount = activeContent.split('\n').length;
  const charCount = activeContent.length;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[var(--bg-app)] text-[var(--text-main)] transition-colors">
      {/* Topbar estilo JetBrains New UI */}
      <Topbar
        activeFileName={activeFile?.name || 'main.ml'}
        status={status}
        onRun={handleRun}
        onAbort={abortExecution}
        onAnalyze={handleAnalyze}
        onSelectExample={(code, title) => handleSelectExample(code, title)}
        onOpenFile={handleOpenFile}
        onDownloadFile={handleDownloadFile}
        onShare={handleShare}
        onOpenCommandPalette={() => setIsPaletteOpen(true)}
        health={health}
        isAnalyzing={isAnalyzing}
      />

      {/* Espaço de Trabalho Principal: ActivityBar + ProjectSidebar + Área do Editor & Ferramentas */}
      <div className="flex-1 flex overflow-hidden">
        {/* Barra de Atividades Vertical Esquerda (IntelliJ IDEA) */}
        <ActivityBar
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setIsToolWindowVisible(true);
          }}
          isToolWindowVisible={isToolWindowVisible}
          onToggleToolWindow={() => setIsToolWindowVisible((prev) => !prev)}
          onOpenCommandPalette={() => setIsPaletteOpen(true)}
          isRunning={status === 'RUNNING' || status === 'WAITING_INPUT' || status === 'CONNECTING'}
          onRun={handleRun}
          onAbort={abortExecution}
          errorsCount={errors.length}
        />

        {/* Painel Lateral de Projeto (IntelliJ IDEA) */}
        {sidebarOpen && (
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
        )}

        {/* Área Central: Splitter Redimensionável (Abaixo ou Direita) */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--bg-surface)]">
          {isToolWindowVisible ? (
            <Group
              key={panelPosition}
              orientation={panelPosition === 'bottom' ? 'vertical' : 'horizontal'}
              id={`arceus-ide-split-${panelPosition}`}
              defaultLayout={
                isToolWindowMaximized
                  ? { 'editor-pane': 15, 'tabs-pane': 85 }
                  : panelPosition === 'bottom'
                  ? { 'editor-pane': 60, 'tabs-pane': 40 }
                  : { 'editor-pane': 55, 'tabs-pane': 45 }
              }
              className="flex-1 overflow-hidden"
            >
              {/* Painel do Editor MiniLang (Fundo cinza preenchendo até o limite) */}
              <Panel
                id="editor-pane"
                minSize={15}
                className="flex flex-col h-full overflow-hidden bg-[var(--bg-surface)]"
              >
                <EditorTabs
                  files={files}
                  activeFileId={activeFileId}
                  onSelectFile={selectFile}
                  onCreateFile={() => createFile()}
                  onCloseFile={closeFile}
                  onRenameFile={renameFile}
                  onCopyCode={handleCopyCode}
                  onFormatCode={handleFormatCode}
                  showMinimap={showMinimap}
                  onToggleMinimap={() => setShowMinimap((prev) => !prev)}
                  sidebarOpen={sidebarOpen}
                  onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
                  panelPosition={panelPosition}
                  onTogglePanelPosition={handleTogglePanelPosition}
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
                    showMinimap={showMinimap}
                  />
                </div>
              </Panel>

              {/* Barra de Redimensionamento Horizontal ou Vertical estilo JetBrains */}
              <Separator
                className={
                  panelPosition === 'bottom'
                    ? 'h-1 w-full bg-[#1e1f22] hover:bg-[#3574f0] transition-colors cursor-row-resize active:bg-[#3574f0] shrink-0'
                    : 'w-1 h-full bg-[#1e1f22] hover:bg-[#3574f0] transition-colors cursor-col-resize active:bg-[#3574f0] shrink-0'
                }
              />

              {/* Painel de Ferramentas (Console, Problemas, AST, CFG, Símbolos, Tokens) */}
              <Panel
                id="tabs-pane"
                minSize={15}
                className="flex flex-col h-full overflow-hidden bg-[var(--bg-panel)]"
              >
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

                <div className="flex-1 overflow-hidden bg-[var(--bg-panel)]">
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
                      onRerun={handleRun}
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
              </Panel>
            </Group>
          ) : (
            /* Tool Window Recolhida: Editor ocupa até o limite inferior */
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--bg-surface)]">
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
                sidebarOpen={sidebarOpen}
                onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
                panelPosition={panelPosition}
                onTogglePanelPosition={handleTogglePanelPosition}
              />

              <div className="flex-1 h-full overflow-hidden bg-[var(--bg-surface)] flex flex-col">
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

              {/* Barra de Ferramentas Inferior recolhida estilo IntelliJ IDEA */}
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
      </div>

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
        onFormatCode={handleFormatCode}
        onSelectExample={(code) => handleSelectExample(code)}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setIsToolWindowVisible(true);
        }}
      />

      {/* Gaveta Lateral de Configurações */}
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
