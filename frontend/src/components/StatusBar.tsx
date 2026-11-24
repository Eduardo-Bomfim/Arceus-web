import { CheckCircle2, AlertCircle, Palette, Terminal, Zap } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface StatusBarProps {
  cursorLine: number;
  cursorCol: number;
  lineCount: number;
  errorsCount: number;
  isPanelOpen: boolean;
  onTogglePanel: () => void;
  onOpenProblems: () => void;
}

export function StatusBar({
  cursorLine,
  cursorCol,
  lineCount,
  errorsCount,
  isPanelOpen,
  onTogglePanel,
  onOpenProblems,
}: StatusBarProps) {
  const { themeConfig, settings, openSettings } = useTheme();

  if (!settings.showStatusBar) return null;

  return (
    <footer className="h-6 px-3 bg-[var(--bg-app)] text-[11px] text-[var(--text-muted)] flex items-center justify-between select-none z-20 shrink-0 transition-colors">
      {/* Esquerda: Diagnósticos + Toggle do Painel + Status --opt */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenProblems}
          className={`flex items-center gap-1.5 transition hover:opacity-90 ${
            errorsCount === 0
              ? 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              : 'text-rose-400 font-medium'
          }`}
          title="Abrir aba de Problemas (Alt+6)"
        >
          {errorsCount === 0 ? (
            <>
              <CheckCircle2 className="w-3 h-3 text-[var(--accent-secondary)]" />
              <span className="hidden sm:inline">Nenhum problema</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3 h-3" />
              <span>
                {errorsCount} {errorsCount === 1 ? 'problema' : 'problemas'}
              </span>
            </>
          )}
        </button>

        <button
          onClick={onTogglePanel}
          className={`flex items-center gap-1 px-1.5 py-0.2 rounded transition ${
            isPanelOpen
              ? 'text-[var(--text-main)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
          title="Alternar Terminal e Painel (Alt+4)"
        >
          <Terminal className="w-3 h-3" />
          <span className="hidden sm:inline">Terminal</span>
        </button>

        {settings.optimize && (
          <button
            onClick={() => openSettings('compiler')}
            title="Otimizador Constant Folding (--opt) ativo — Clique para configurar"
            className="flex items-center gap-1 text-amber-400/90 hover:text-amber-300 transition"
          >
            <Zap className="w-3 h-3" />
            <span className="font-mono text-[10.5px]">--opt</span>
          </button>
        )}
      </div>

      {/* Direita: Cursor Real + Indentação Real + Tema */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-[var(--text-main)]">
          Ln {cursorLine}, Col {cursorCol}
        </span>

        <button
          onClick={() => openSettings('editor')}
          title="Configurar tamanho de indentação e fonte"
          className="hidden sm:inline hover:text-[var(--text-main)] transition"
        >
          {settings.tabSize} espaços
        </button>

        <span className="hidden md:inline">{lineCount} linhas</span>

        <button
          onClick={() => openSettings('appearance')}
          className="flex items-center gap-1.5 hover:text-[var(--text-main)] transition"
          title="Alterar tema ou aparência (Ctrl+,)"
        >
          <Palette className="w-3 h-3 text-[var(--accent-primary)]" />
          <span>{themeConfig.name}</span>
        </button>
      </div>
    </footer>
  );
}
