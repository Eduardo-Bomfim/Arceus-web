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
import { AstPanel } from './components/panels/AstPanel';
import { SymbolTablePanel } from './components/panels/SymbolTablePanel';
import { TokensPanel } from './components/panels/TokensPanel';
import { DiagnosticsPanel } from './components/panels/DiagnosticsPanel';

import { useArceusRunner } from './hooks/useArceusRunner';
import { EXAMPLES } from './examples';
import {
  downloadFile,
  loadStoredCode,
  openLocalFile,
  saveStoredCode,
} from './utils/file-utils';

type TabType = 'console' | 'problems' | 'ast' | 'symbols' | 'tokens';

export default function App() {
  const [code, setCode] = useState<string>(() =>
    loadStoredCode(EXAMPLES[0].code)
  );
  const [optimize, setOptimize] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('console');

  const editorRef = useRef<CodeEditorRef>(null);

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

  // Atalhos universais globais (F9, Ctrl+Enter, Esc)
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

  // Análise inicial ao carregar
  useEffect(() => {
    runAnalysis(code, optimize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Navegar para erro específico no editor ao clicar na lista de diagnósticos
  const handleSelectError = (line: number, column?: number) => {
    editorRef.current?.goToLine(line, column);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0c1017]">
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
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-[#1e293b]">
        {/* Painel Esquerdo: Editor MiniLang */}
        <div className="flex flex-col h-full overflow-hidden bg-[#0f141c]">
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#0b0f17] border-b border-[#1e293b] text-xs text-slate-400 select-none">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              Editor MiniLang (Portugol)
            </span>
            <span className="text-[11px] text-slate-500">UTF-8 • .ml</span>
          </div>

          <div className="flex-1 overflow-hidden">
            <CodeEditor
              ref={editorRef}
              value={code}
              onChange={handleCodeChange}
              errors={errors}
              onRunShortcut={handleRun}
            />
          </div>
        </div>

        {/* Painel Direito: Abas de Execução e Inspeção */}
        <div className="flex flex-col h-full overflow-hidden bg-[#0a0e14]">
          {/* Navegação de Abas */}
          <div className="flex items-center bg-[#0b0f17] border-b border-[#1e293b] px-2 select-none overflow-x-auto text-xs">
            <button
              onClick={() => setActiveTab('console')}
              className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition ${
                activeTab === 'console'
                  ? 'border-sky-400 text-sky-400 bg-[#131b27]'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#111722]'
              }`}
            >
              <TerminalIcon className="w-3.5 h-3.5" />
              <span>Console</span>
            </button>

            <button
              onClick={() => setActiveTab('problems')}
              className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition ${
                activeTab === 'problems'
                  ? 'border-rose-400 text-rose-400 bg-[#131b27]'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#111722]'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Problemas</span>
              {errors.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-900 text-rose-200 font-bold">
                  {errors.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('ast')}
              className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition ${
                activeTab === 'ast'
                  ? 'border-indigo-400 text-indigo-400 bg-[#131b27]'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#111722]'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>AST (Árvore)</span>
            </button>

            <button
              onClick={() => setActiveTab('symbols')}
              className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition ${
                activeTab === 'symbols'
                  ? 'border-cyan-400 text-cyan-400 bg-[#131b27]'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#111722]'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Símbolos</span>
            </button>

            <button
              onClick={() => setActiveTab('tokens')}
              className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition ${
                activeTab === 'tokens'
                  ? 'border-amber-400 text-amber-400 bg-[#131b27]'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#111722]'
              }`}
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
    </div>
  );
}
