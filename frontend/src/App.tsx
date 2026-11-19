import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Terminal as TerminalIcon,
  AlertOctagon,
  GitCompare,
  Database,
  Binary,
} from 'lucide-react';

import { CodeEditor } from './editor/CodeEditor';
import type { CodeEditorRef } from './editor/CodeEditor';
import { Topbar } from './components/Topbar';
import { Terminal } from './components/Terminal';
import { StatusBar } from './components/StatusBar';
import { AstPanel } from './components/panels/AstPanel';
import { SymbolTablePanel } from './components/panels/SymbolTablePanel';
import { TokensPanel } from './components/panels/TokensPanel';
import { DiagnosticsPanel } from './components/panels/DiagnosticsPanel';

import { ThemeProvider, useTheme } from './context/ThemeContext';
import { useArceusRunner } from './hooks/useArceusRunner';
import { EXAMPLES } from './examples';
import {
  downloadFile,
  loadStoredCode,
  openLocalFile,
  saveStoredCode,
} from './utils/file-utils';

type TabType = 'console' | 'problems' | 'ast' | 'symbols' | 'tokens';

function IdeWorkspace() {
  const [code, setCode] = useState<string>(() =>
    loadStoredCode(EXAMPLES[0].code)
  );
  const [optimize, setOptimize] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('console');

  // Coordenadas do cursor no editor
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  const editorRef = useRef<CodeEditorRef>(null);
  const { theme, themeConfig } = useTheme();

  const {
    status,
    stdout,
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

  // Salva no localStorage sempre que o código for alterado
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    saveStoredCode(newCode);
  };

  // Dispara execução
  const handleRun = useCallback(() => {
    setActiveTab('console');
    runProgram(code, optimize);
  }, [code, optimize, runProgram]);

  // Dispara apenas análise estática
  const handleAnalyze = useCallback(async () => {
    const res = await runAnalysis(code, optimize);
    if (res && res.errors.length > 0) {
      setActiveTab('problems');
    } else {
      setActiveTab('ast');
    }
  }, [code, optimize, runAnalysis]);

  // Seleciona exemplo
  const handleSelectExample = (exampleCode: string) => {
    setCode(exampleCode);
    saveStoredCode(exampleCode);
    runAnalysis(exampleCode, optimize);
  };

  // Abrir arquivo local
  const handleOpenFile = () => {
    openLocalFile((content) => {
      setCode(content);
      saveStoredCode(content);
      runAnalysis(content, optimize);
    });
  };

  // Baixar arquivo local
  const handleDownloadFile = () => {
    downloadFile('programa_arceus.ml', code);
  };

  // Atalhos globais (F9, Ctrl+Enter, Esc)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F9' || (e.ctrlKey && e.key === 'Enter')) {
        e.preventDefault();
        handleRun();
      } else if (e.key === 'Escape') {
        if (status === 'RUNNING' || status === 'WAITING_INPUT') {
          abortExecution();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleRun, status, abortExecution]);

  // Análise inicial
  useEffect(() => {
    runAnalysis(code, optimize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectError = (line: number, column?: number) => {
    editorRef.current?.goToLine(line, column);
  };

  const lineCount = code.split('\n').length;
  const charCount = code.length;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[var(--bg-app)] text-[var(--text-main)] transition-colors">
      {/* Topbar */}
      <Topbar
        status={status}
        optimize={optimize}
        onToggleOptimize={(opt) => {
          setOptimize(opt);
          runAnalysis(code, opt);
        }}
        onRun={handleRun}
        onAbort={abortExecution}
        onAnalyze={handleAnalyze}
        onSelectExample={handleSelectExample}
        onOpenFile={handleOpenFile}
        onDownloadFile={handleDownloadFile}
        health={health}
        isAnalyzing={isAnalyzing}
      />

      {/* Conteúdo Principal: Split View (Editor à Esquerda, Abas à Direita/Abaixo) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-[var(--border-color)]">
        {/* Painel Esquerdo: Editor MiniLang */}
        <div className="flex flex-col h-full overflow-hidden bg-[var(--bg-surface)]">
          <div className="flex items-center justify-between px-3 py-1.5 bg-[var(--bg-header)] border-b border-[var(--border-color)] text-xs text-[var(--text-muted)] select-none">
            <span className="font-semibold text-[var(--text-main)] flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: themeConfig.primaryColor }}
              />
              Editor MiniLang (Portugol)
            </span>
            <span className="text-[11px] text-[var(--text-muted)] font-mono">
              MiniLang 2026.2 • UTF-8
            </span>
          </div>

          <div className="flex-1 overflow-hidden">
            <CodeEditor
              ref={editorRef}
              value={code}
              onChange={handleCodeChange}
              errors={errors}
              onRunShortcut={handleRun}
              theme={theme}
              onCursorChange={(line, col) => setCursorPos({ line, col })}
            />
          </div>
        </div>

        {/* Painel Direito: Abas de Execução e Inspeção */}
        <div className="flex flex-col h-full overflow-hidden bg-[var(--bg-panel)]">
          {/* Navegação de Abas */}
          <div className="flex items-center bg-[var(--bg-header)] border-b border-[var(--border-color)] px-2 select-none overflow-x-auto text-xs">
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
            </button>
          </div>

          {/* Conteúdo da Aba Ativa */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'console' && (
              <Terminal
                stdout={stdout}
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
              />
            )}

            {activeTab === 'symbols' && (
              <SymbolTablePanel
                symbols={analysisData?.symbol_table ?? []}
              />
            )}

            {activeTab === 'tokens' && (
              <TokensPanel
                tokens={analysisData?.tokens ?? []}
              />
            )}
          </div>
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
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <IdeWorkspace />
    </ThemeProvider>
  );
}
