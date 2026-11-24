import { EXAMPLES } from '../examples';
import { ACCENT_PRESETS, THEMES } from '../context/themePresets';
import type { SettingsTabSection } from '../context/themePresets';
import type { EditorFile } from '../hooks/useFiles';
import type { TabType } from '../hooks/useTabs';
import type { TerminalMessage, TerminalMessageType } from '../hooks/useArceusRunner';
import type {
  AccentOverride,
  AnalyzeResponse,
  EditorSettings,
  RunResponse,
  ThemeId,
} from '../types';

export type VirtualCwd = '~/arceus-web/src' | '~/arceus-web' | '~/arceus-web/exemplos';

export interface TerminalCommandContext {
  cwd: VirtualCwd;
  setCwd: (cwd: VirtualCwd) => void;
  files: EditorFile[];
  activeFile: EditorFile;
  selectFile: (id: string) => void;
  createFile: (name?: string, content?: string) => EditorFile;
  upsertFile: (name: string, content: string, append?: boolean) => EditorFile;
  closeFile: (id: string) => void;
  renameFile: (id: string, newName: string) => void;
  updateFileContentById: (id: string, content: string) => void;
  optimize: boolean;
  maxSteps: number;
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  settings: EditorSettings;
  updateSettings: (patch: Partial<EditorSettings>) => void;
  openSettings: (section?: SettingsTabSection) => void;
  onRunFile: (source: string, opt: boolean, fileName: string) => Promise<void>;
  onAnalyzeSource: (source: string, opt: boolean) => Promise<AnalyzeResponse | null>;
  onRunHttp: (source: string, opt: boolean) => Promise<RunResponse>;
  onCheckHealth: () => Promise<{ ok: boolean; compiler?: string; python?: string }>;
  onFormatSource: (code: string) => string;
  onShare: () => void;
  onGoToLine: (line: number, col?: number) => void;
  history: string[];
  clearTerminal: () => void;
  emit: (
    type: TerminalMessageType,
    text: string,
    meta?: TerminalMessage['meta']
  ) => void;
  onSwitchTab: (tab: TabType) => void;
}

export const COMMAND_NAMES = [
  'help',
  'clear',
  'cls',
  'arceus',
  'run',
  'check',
  'analyze',
  'ast',
  'tokens',
  'symbols',
  'format',
  'opt',
  'ml',
  'ls',
  'dir',
  'pwd',
  'cd',
  'cat',
  'touch',
  'new',
  'open',
  'rm',
  'mv',
  'cp',
  'grep',
  'wc',
  'echo',
  'examples',
  'exemplos',
  'theme',
  'tema',
  'accent',
  'config',
  'settings',
  'share',
  'status',
  'ping',
  'calc',
  'history',
  'date',
  'whoami',
  'version',
];

const ARCEUS_SUBCOMMANDS = [
  'run',
  'check',
  'analyze',
  'ast',
  'tokens',
  'symbols',
  'format',
  'opt',
  'eval',
  'status',
  '--version',
];

const CONFIG_SECTIONS: SettingsTabSection[] = [
  'appearance',
  'editor',
  'terminal',
  'compiler',
  'keymap',
];

/**
 * Divide comandos encadeados com `&&` ou `;` respeitando aspas simples e duplas.
 */
export function splitChainedCommands(input: string): string[] {
  const parts: string[] = [];
  let current = '';
  let quote: '"' | "'" | null = null;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    const next = input[i + 1];

    if (quote) {
      if (ch === '\\' && next === quote) {
        current += ch + next;
        i++;
        continue;
      }
      if (ch === quote) {
        quote = null;
      }
      current += ch;
      continue;
    }

    if (ch === '"' || ch === "'") {
      quote = ch;
      current += ch;
      continue;
    }

    if (ch === ';') {
      if (current.trim()) parts.push(current.trim());
      current = '';
      continue;
    }

    if (ch === '&' && next === '&') {
      if (current.trim()) parts.push(current.trim());
      current = '';
      i++;
      continue;
    }

    current += ch;
  }

  if (current.trim()) parts.push(current.trim());
  return parts;
}

export interface ParsedCommand {
  args: string[];
  redirectTarget?: string;
  redirectAppend?: boolean;
}

/**
 * Faz o parse de argumentos respeitando aspas e operadores de redirecionamento (`>`, `>>`).
 */
export function parseSingleCommand(input: string): ParsedCommand {
  const tokens: string[] = [];
  let current = '';
  let quote: '"' | "'" | null = null;
  let hasToken = false;

  const pushToken = () => {
    if (hasToken || current.length > 0) {
      tokens.push(current);
      current = '';
      hasToken = false;
    }
  };

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    const next = input[i + 1];

    if (quote) {
      if (ch === '\\' && (next === quote || next === '\\' || next === 'n')) {
        current += next === 'n' ? '\n' : next;
        i++;
        continue;
      }
      if (ch === quote) {
        quote = null;
        continue;
      }
      current += ch;
      continue;
    }

    if (ch === '"' || ch === "'") {
      quote = ch;
      hasToken = true;
      continue;
    }

    if (/\s/.test(ch)) {
      pushToken();
      continue;
    }

    if (ch === '>') {
      pushToken();
      if (next === '>') {
        tokens.push('>>');
        i++;
      } else {
        tokens.push('>');
      }
      continue;
    }

    current += ch;
    hasToken = true;
  }

  pushToken();

  // Separa redirecionamento ao final
  const redirectIdx = tokens.findIndex((t) => t === '>' || t === '>>');
  if (redirectIdx !== -1 && tokens[redirectIdx + 1]) {
    return {
      args: tokens.slice(0, redirectIdx),
      redirectTarget: tokens[redirectIdx + 1],
      redirectAppend: tokens[redirectIdx] === '>>',
    };
  }

  return { args: tokens };
}

/**
 * Avaliador seguro de expressões matemáticas e lógicas (descida recursiva, sem eval).
 */
export function evaluateSafeExpression(expr: string): string {
  let pos = 0;
  const cleaned = expr.trim();
  if (!cleaned) throw new Error('Expressão vazia.');

  const peek = () => cleaned[pos] ?? '';
  const skipWs = () => {
    while (pos < cleaned.length && /\s/.test(cleaned[pos])) pos++;
  };

  const parseExpr = (): number | boolean => parseOr();

  const parseOr = (): number | boolean => {
    let left = parseAnd();
    while (true) {
      skipWs();
      if (cleaned.slice(pos, pos + 2) === '||') {
        pos += 2;
        const right = parseAnd();
        left = Boolean(left) || Boolean(right);
      } else {
        break;
      }
    }
    return left;
  };

  const parseAnd = (): number | boolean => {
    let left = parseCompare();
    while (true) {
      skipWs();
      if (cleaned.slice(pos, pos + 2) === '&&') {
        pos += 2;
        const right = parseCompare();
        left = Boolean(left) && Boolean(right);
      } else {
        break;
      }
    }
    return left;
  };

  const parseCompare = (): number | boolean => {
    const left = parseAdd();
    skipWs();
    const two = cleaned.slice(pos, pos + 2);
    if (two === '==' || two === '!=' || two === '<=' || two === '>=') {
      pos += 2;
      const right = parseAdd();
      if (two === '==') return left === right;
      if (two === '!=') return left !== right;
      if (two === '<=') return Number(left) <= Number(right);
      return Number(left) >= Number(right);
    }
    const one = peek();
    if (one === '<' || one === '>') {
      pos++;
      const right = parseAdd();
      return one === '<' ? Number(left) < Number(right) : Number(left) > Number(right);
    }
    return left;
  };

  const parseAdd = (): number | boolean => {
    let left = parseMul();
    while (true) {
      skipWs();
      const ch = peek();
      if (ch === '+' || ch === '-') {
        pos++;
        const right = Number(parseMul());
        left = ch === '+' ? Number(left) + right : Number(left) - right;
      } else {
        break;
      }
    }
    return left;
  };

  const parseMul = (): number | boolean => {
    let left = parsePow();
    while (true) {
      skipWs();
      const ch = peek();
      if (ch === '*' || ch === '/' || ch === '%') {
        if (cleaned.slice(pos, pos + 2) === '**') break;
        pos++;
        const right = Number(parsePow());
        if (ch === '/') {
          if (right === 0) throw new Error('Divisão por zero.');
          left = Number(left) / right;
        } else if (ch === '%') {
          if (right === 0) throw new Error('Módulo por zero.');
          left = Number(left) % right;
        } else {
          left = Number(left) * right;
        }
      } else {
        break;
      }
    }
    return left;
  };

  const parsePow = (): number | boolean => {
    const base = parseUnary();
    skipWs();
    if (cleaned.slice(pos, pos + 2) === '**' || peek() === '^') {
      pos += cleaned.slice(pos, pos + 2) === '**' ? 2 : 1;
      const exp = Number(parsePow());
      return Math.pow(Number(base), exp);
    }
    return base;
  };

  const parseUnary = (): number | boolean => {
    skipWs();
    const ch = peek();
    if (ch === '-') {
      pos++;
      return -Number(parseUnary());
    }
    if (ch === '+') {
      pos++;
      return Number(parseUnary());
    }
    if (ch === '!') {
      pos++;
      return !parseUnary();
    }
    return parsePrimary();
  };

  const parsePrimary = (): number | boolean => {
    skipWs();
    if (peek() === '(') {
      pos++;
      const val = parseExpr();
      skipWs();
      if (peek() !== ')') throw new Error("Esperado ')' na expressão.");
      pos++;
      return val;
    }

    if (cleaned.slice(pos, pos + 4) === 'true' || cleaned.slice(pos, pos + 10) === 'verdadeiro') {
      const len = cleaned.slice(pos, pos + 4) === 'true' ? 4 : 10;
      pos += len;
      return true;
    }
    if (cleaned.slice(pos, pos + 5) === 'false' || cleaned.slice(pos, pos + 5) === 'falso') {
      pos += 5;
      return false;
    }

    const numMatch = /^\d+(?:\.\d+)?/.exec(cleaned.slice(pos));
    if (numMatch) {
      pos += numMatch[0].length;
      return Number(numMatch[0]);
    }

    throw new Error(`Token inesperado próximo a "${cleaned.slice(pos)}"`);
  };

  const result = parseExpr();
  skipWs();
  if (pos < cleaned.length) {
    throw new Error(`Símbolo inválido próximo a "${cleaned.slice(pos)}"`);
  }

  return typeof result === 'boolean'
    ? result ? 'verdadeiro' : 'falso'
    : Number.isInteger(result)
    ? String(result)
    : Number(result.toFixed(6)).toString();
}

function resolveWorkspaceOrExampleFile(
  nameArg: string | undefined,
  files: EditorFile[],
  activeFile: EditorFile
): { file?: EditorFile; example?: (typeof EXAMPLES)[number]; isExample?: boolean } {
  if (!nameArg) {
    return { file: activeFile };
  }

  const clean = nameArg
    .replace(/^~\/arceus-web\//, '')
    .replace(/^src\//, '')
    .replace(/^exemplos\//, '')
    .trim();

  const exactWorkspace = files.find(
    (f) => f.name.toLowerCase() === clean.toLowerCase()
  );
  if (exactWorkspace) return { file: exactWorkspace };

  const withMlWorkspace = files.find(
    (f) => f.name.toLowerCase() === `${clean}.ml`.toLowerCase()
  );
  if (withMlWorkspace) return { file: withMlWorkspace };

  const exampleMatch = EXAMPLES.find(
    (ex) =>
      ex.id.toLowerCase() === clean.toLowerCase() ||
      `${ex.id}.ml`.toLowerCase() === clean.toLowerCase()
  );
  if (exampleMatch) return { example: exampleMatch, isExample: true };

  return {};
}

export interface AutocompleteResult {
  completed: string;
  candidates: string[];
}

export function getAutocompleteResult(
  input: string,
  files: EditorFile[]
): AutocompleteResult {
  const parts = input.split(/\s+/);
  const trailingSpace = /\s$/.test(input);
  const currentWord = trailingSpace ? '' : parts[parts.length - 1] ?? '';
  const lowerWord = currentWord.toLowerCase();

  let pool: string[] = [];

  if (parts.length <= 1 && !trailingSpace) {
    pool = COMMAND_NAMES;
  } else {
    const first = parts[0].toLowerCase();
    if (first === 'arceus' && (parts.length === 1 || (parts.length === 2 && !trailingSpace))) {
      pool = ARCEUS_SUBCOMMANDS;
    } else if (first === 'theme' || first === 'tema') {
      pool = THEMES.map((t) => t.id);
    } else if (first === 'accent') {
      pool = ['theme', ...Object.keys(ACCENT_PRESETS)];
    } else if (first === 'config' || first === 'settings') {
      pool = CONFIG_SECTIONS;
    } else if (first === 'examples' || first === 'exemplos' || first === 'example') {
      pool = EXAMPLES.map((e) => e.id);
    } else if (first === 'opt') {
      pool = ['on', 'off', 'status'];
    } else if (first === 'cd') {
      pool = ['src', 'exemplos', '..', '~'];
    } else {
      pool = [
        ...files.map((f) => f.name),
        ...EXAMPLES.map((e) => `${e.id}.ml`),
      ];
    }
  }

  const matches = Array.from(
    new Set(pool.filter((item) => item.toLowerCase().startsWith(lowerWord)))
  ).sort();

  if (matches.length === 0) {
    return { completed: input, candidates: [] };
  }

  if (matches.length === 1) {
    const prefix = trailingSpace
      ? input
      : input.slice(0, input.length - currentWord.length);
    return { completed: `${prefix}${matches[0]} `, candidates: [] };
  }

  // Encontra prefixo comum entre múltiplos candidatos
  let common = matches[0];
  for (let i = 1; i < matches.length; i++) {
    while (!matches[i].toLowerCase().startsWith(common.toLowerCase())) {
      common = common.slice(0, -1);
    }
  }

  const prefix = trailingSpace
    ? input
    : input.slice(0, input.length - currentWord.length);

  return {
    completed: common.length > currentWord.length ? `${prefix}${common}` : input,
    candidates: matches,
  };
}

function renderHelp(topic: string | undefined, emit: TerminalCommandContext['emit']) {
  if (topic) {
    const t = topic.toLowerCase();
    if (t === 'arceus' || t === 'run') {
      emit('info', 'Comandos do Compilador Arceus:');
      emit('code', [
        '  run [arquivo] [--opt]       Compila e executa (WebSocket interativo)',
        '  check [arquivo] [--opt]     Executa análise léxica, sintática e semântica',
        '  ast [arquivo] [--opt]       Exibe a AST (e otimizada com --opt)',
        '  tokens [arquivo]            Lista tabela de tokens léxicos',
        '  symbols [arquivo]           Exibe tabela de símbolos declarados',
        '  format [arquivo]            Formata código MiniLang automaticamente',
        '  opt [on|off]                Alterna Constant Folding (--opt)',
        '  ml "<código>"               Executa trecho rápido MiniLang no backend',
      ].join('\n'));
      return;
    }
  }

  emit('info', 'Arceus IDE Terminal — Comandos Disponíveis');
  emit('code', [
    '  Compilador MiniLang:',
    '    run [arquivo] [--opt]     Executa o programa no terminal interativo',
    '    check [arquivo] [--opt]   Verifica erros léxicos, sintáticos e semânticos',
    '    ast [arquivo] [--opt]     Exibe a Árvore Sintática Abstrata',
    '    tokens / symbols          Inspeciona tokens léxicos ou tabela de símbolos',
    '    format [arquivo]          Formata código-fonte no editor',
    '    opt [on|off]              Liga/desliga Constant Folding (--opt)',
    '    ml "<instruções>"         Avalia snippet MiniLang rápido no servidor',
    '',
    '  Workspace & Arquivos:',
    '    ls [-l] / cd / pwd        Navega e lista arquivos do projeto e exemplos',
    '    cat [-n] <arquivo>        Exibe conteúdo de um arquivo',
    '    touch <arquivo>           Cria e abre um novo arquivo .ml',
    '    open <arquivo>            Foca um arquivo no editor',
    '    mv <antigo> <novo>        Renomeia um arquivo',
    '    cp <origem> <destino>     Duplica um arquivo',
    '    rm <arquivo>              Remove um arquivo do workspace',
    '    grep <texto> [arquivo]    Busca ocorrências no código',
    '    wc [arquivo]              Conta linhas, palavras e caracteres',
    '    echo "texto" [> arq]      Imprime ou grava em arquivo do projeto',
    '    examples [load <id>]      Lista ou carrega modelos de exemplo',
    '',
    '  IDE, Aparência & Sistema:',
    '    theme [id]                Lista ou aplica temas visuais em toda a IDE',
    '    accent [cor]              Altera cor de destaque (blue, amber, cyan...)',
    '    config [aba]              Abre Configurações (appearance, editor, terminal...)',
    '    status / ping             Testa conexão e versões do compilador backend',
    '    calc <expressão>          Calculadora segura (+, -, *, /, %, ^)',
    '    history / clear (Ctrl+L)  Histórico e limpeza do terminal',
  ].join('\n'));
}

export async function executeTerminalCommandLine(
  rawInput: string,
  ctx: TerminalCommandContext
): Promise<void> {
  const trimmed = rawInput.trim();
  if (!trimmed) return;

  ctx.emit('command', trimmed, { prompt: ctx.cwd });

  // Cópia mutável para encadeamentos (ex: `touch a.ml && open a.ml && check a.ml`) enxergarem alterações imediatamente
  const chainCtx: TerminalCommandContext = {
    ...ctx,
    files: [...ctx.files],
    settings: { ...ctx.settings },
  };

  const commands = splitChainedCommands(trimmed);
  for (const cmdStr of commands) {
    const ok = await runSingleParsedCommand(cmdStr, chainCtx);
    if (!ok) break;
  }
}

async function runSingleParsedCommand(
  cmdStr: string,
  ctx: TerminalCommandContext
): Promise<boolean> {
  const parsed = parseSingleCommand(cmdStr);
  const { args, redirectTarget, redirectAppend } = parsed;
  if (args.length === 0) return true;

  const cmd = args[0].toLowerCase();
  const rest = args.slice(1);

  // Redirecionamento: captura linhas emitidas se houver `>` ou `>>`
  let capturedOutput: string[] = [];
  const emitTarget: TerminalCommandContext['emit'] = redirectTarget
    ? (type, text, meta) => {
        if (type === 'error' || type === 'warn') {
          ctx.emit(type, text, meta);
        } else {
          capturedOutput.push(text);
        }
      }
    : ctx.emit;

  const flushRedirect = () => {
    if (!redirectTarget) return;
    const textToWrite = capturedOutput.join('\n');
    const saved = ctx.upsertFile(redirectTarget, textToWrite, redirectAppend);
    const existingIdx = ctx.files.findIndex((f) => f.id === saved.id);
    if (existingIdx !== -1) {
      ctx.files[existingIdx] = saved;
    } else {
      ctx.files.push(saved);
    }
    ctx.activeFile = saved;
    ctx.selectFile(saved.id);
    ctx.emit(
      'success',
      `Saída ${redirectAppend ? 'adicionada em' : 'gravada em'} '${saved.name}'.`
    );
  };

  try {
    // 1. Help & Clear
    if (cmd === 'help' || cmd === '?') {
      renderHelp(rest[0], emitTarget);
      flushRedirect();
      return true;
    }

    if (cmd === 'clear' || cmd === 'cls') {
      ctx.clearTerminal();
      return true;
    }

    // 2. Comando `arceus <subcmd>` unificado com atalhos diretos
    let effectiveCmd = cmd;
    let effectiveArgs = rest;
    if (cmd === 'arceus') {
      if (rest.length === 0 || rest[0] === '--help' || rest[0] === '-h') {
        renderHelp('arceus', emitTarget);
        flushRedirect();
        return true;
      }
      if (rest[0] === '--version' || rest[0] === '-v' || rest[0] === 'version') {
        effectiveCmd = 'version';
        effectiveArgs = [];
      } else {
        effectiveCmd = rest[0].toLowerCase();
        effectiveArgs = rest.slice(1);
      }
    }

    // 3. Compilador & Execução
    if (effectiveCmd === 'run') {
      const hasOptFlag = effectiveArgs.includes('--opt') || effectiveArgs.includes('-o');
      const fileArg = effectiveArgs.find((a) => !a.startsWith('-'));
      const resolved = resolveWorkspaceOrExampleFile(fileArg, ctx.files, ctx.activeFile);

      if (!resolved.file && !resolved.example) {
        ctx.emit('error', `Arquivo não encontrado: '${fileArg}'. Use 'ls' para listar.`);
        return false;
      }

      const source = resolved.file ? resolved.file.content : resolved.example!.code;
      const targetName = resolved.file ? resolved.file.name : `${resolved.example!.id}.ml`;
      if (resolved.file) ctx.selectFile(resolved.file.id);

      const useOpt = hasOptFlag ? true : ctx.optimize;
      await ctx.onRunFile(source, useOpt, targetName);
      return true;
    }

    if (effectiveCmd === 'check' || effectiveCmd === 'analyze' || effectiveCmd === 'lint') {
      const hasOptFlag = effectiveArgs.includes('--opt') || effectiveArgs.includes('-o');
      const fileArg = effectiveArgs.find((a) => !a.startsWith('-'));
      const resolved = resolveWorkspaceOrExampleFile(fileArg, ctx.files, ctx.activeFile);

      if (!resolved.file && !resolved.example) {
        ctx.emit('error', `Arquivo não encontrado: '${fileArg}'.`);
        return false;
      }

      const source = resolved.file ? resolved.file.content : resolved.example!.code;
      const targetName = resolved.file ? resolved.file.name : `${resolved.example!.id}.ml`;
      const res = await ctx.onAnalyzeSource(source, hasOptFlag || ctx.optimize);

      if (!res) {
        ctx.emit('error', 'Não foi possível comunicar com o compilador backend.');
        return false;
      }

      if (res.success) {
        emitTarget(
          'success',
          `✓ '${targetName}': nenhum erro encontrado (${res.tokens.length} tokens, ${res.symbol_table.length} símbolos).`
        );
      } else {
        emitTarget('warn', `'${targetName}': ${res.errors.length} problema(s) encontrado(s):`);
        res.errors.forEach((err) => {
          ctx.emit(
            'error',
            `  [${err.phase}] ${targetName}:${err.line}:${err.column} — ${err.message}`,
            { file: targetName, line: err.line, column: err.column }
          );
        });
      }
      flushRedirect();
      return res.success;
    }

    if (effectiveCmd === 'ast') {
      const hasOptFlag = effectiveArgs.includes('--opt') || effectiveArgs.includes('-o');
      const fileArg = effectiveArgs.find((a) => !a.startsWith('-'));
      const resolved = resolveWorkspaceOrExampleFile(fileArg, ctx.files, ctx.activeFile);
      if (!resolved.file && !resolved.example) {
        ctx.emit('error', `Arquivo não encontrado: '${fileArg}'.`);
        return false;
      }
      const source = resolved.file ? resolved.file.content : resolved.example!.code;
      const useOpt = hasOptFlag || ctx.optimize;
      const res = await ctx.onAnalyzeSource(source, useOpt);
      if (!res) return false;

      if (useOpt && res.ast_optimized) {
        emitTarget('info', 'AST Otimizada (Constant Folding ativo):');
        emitTarget('code', res.ast_optimized);
      } else if (res.ast_raw) {
        emitTarget('info', 'Árvore Sintática Abstrata (AST):');
        emitTarget('code', res.ast_raw);
      } else {
        ctx.emit('error', 'Não foi possível gerar a AST devido a erros sintáticos.');
        return false;
      }
      flushRedirect();
      return true;
    }

    if (effectiveCmd === 'tokens') {
      const fileArg = effectiveArgs.find((a) => !a.startsWith('-'));
      const resolved = resolveWorkspaceOrExampleFile(fileArg, ctx.files, ctx.activeFile);
      if (!resolved.file && !resolved.example) {
        ctx.emit('error', `Arquivo não encontrado: '${fileArg}'.`);
        return false;
      }
      const source = resolved.file ? resolved.file.content : resolved.example!.code;
      const res = await ctx.onAnalyzeSource(source, ctx.optimize);
      if (!res) return false;

      const rows = res.tokens.map(
        (t) =>
          `${String(t.line).padStart(3)}:${String(t.column).padEnd(3)}  ${t.type.padEnd(12)}  ${
            t.type === 'EOF' ? '<EOF>' : t.value
          }`
      );
      emitTarget('info', `Tokens Léxicos (${res.tokens.length}):`);
      emitTarget('code', rows.join('\n'));
      flushRedirect();
      return true;
    }

    if (effectiveCmd === 'symbols' || effectiveCmd === 'sym') {
      const fileArg = effectiveArgs.find((a) => !a.startsWith('-'));
      const resolved = resolveWorkspaceOrExampleFile(fileArg, ctx.files, ctx.activeFile);
      if (!resolved.file && !resolved.example) {
        ctx.emit('error', `Arquivo não encontrado: '${fileArg}'.`);
        return false;
      }
      const source = resolved.file ? resolved.file.content : resolved.example!.code;
      const res = await ctx.onAnalyzeSource(source, ctx.optimize);
      if (!res) return false;

      if (res.symbol_table.length === 0) {
        emitTarget('muted', 'Tabela de símbolos vazia.');
      } else {
        const rows = res.symbol_table.map(
          (s) =>
            `${s.name.padEnd(18)}  ${s.type.padEnd(10)}  ${s.scope.padEnd(10)}  L${s.line}:${s.column}  ${
              s.initialized ? 'inicializada' : 'não inicializada'
            }`
        );
        emitTarget('info', `Tabela de Símbolos (${res.symbol_table.length}):`);
        emitTarget('code', rows.join('\n'));
      }
      flushRedirect();
      return true;
    }

    if (effectiveCmd === 'format') {
      const fileArg = effectiveArgs[0];
      const resolved = resolveWorkspaceOrExampleFile(fileArg, ctx.files, ctx.activeFile);
      if (!resolved.file) {
        ctx.emit('error', `Somente arquivos do workspace podem ser formatados.`);
        return false;
      }
      const formatted = ctx.onFormatSource(resolved.file.content);
      resolved.file.content = formatted;
      ctx.updateFileContentById(resolved.file.id, formatted);
      emitTarget('success', `✓ '${resolved.file.name}' formatado com sucesso.`);
      flushRedirect();
      return true;
    }

    if (effectiveCmd === 'opt') {
      const arg = effectiveArgs[0]?.toLowerCase();
      if (!arg || arg === 'status') {
        emitTarget(
          'info',
          `Constant Folding (--opt): ${ctx.optimize ? 'ATIVADO' : 'DESATIVADO'}`
        );
        return true;
      }
      if (arg === 'on' || arg === 'true' || arg === '1') {
        ctx.optimize = true;
        ctx.updateSettings({ optimize: true });
        await ctx.onAnalyzeSource(ctx.activeFile.content, true);
        emitTarget('success', '✓ Constant Folding (--opt) ATIVADO.');
        return true;
      }
      if (arg === 'off' || arg === 'false' || arg === '0') {
        ctx.optimize = false;
        ctx.updateSettings({ optimize: false });
        await ctx.onAnalyzeSource(ctx.activeFile.content, false);
        emitTarget('info', 'Constant Folding (--opt) DESATIVADO.');
        return true;
      }
      ctx.emit('error', "Uso: opt [on|off|status]");
      return false;
    }

    if (effectiveCmd === 'ml' || effectiveCmd === 'eval') {
      const rawSnippet = effectiveArgs.join(' ').trim();
      if (!rawSnippet) {
        ctx.emit('error', 'Uso: ml "var x inteiro; x = 2 + 3; escreva x;"');
        return false;
      }
      const wrappedSource = /^\s*programa\b/.test(rawSnippet)
        ? rawSnippet
        : `programa _terminal_eval {\n  ${rawSnippet}\n} fim.`;

      try {
        const res = await ctx.onRunHttp(wrappedSource, ctx.optimize);
        if (res.stdout) {
          emitTarget('stdout', res.stdout.replace(/\n$/, ''));
        }
        if (res.errors.length > 0) {
          res.errors.forEach((err) => {
            ctx.emit('error', `[${err.phase}] ${err.message}`);
          });
          return false;
        }
        emitTarget('muted', `(${res.duration_ms} ms)`);
        flushRedirect();
        return true;
      } catch (err) {
        ctx.emit('error', err instanceof Error ? err.message : String(err));
        return false;
      }
    }

    // 4. Sistema de Arquivos Virtual do Workspace
    if (cmd === 'pwd') {
      emitTarget('code', ctx.cwd);
      flushRedirect();
      return true;
    }

    if (cmd === 'cd') {
      const target = rest[0]?.toLowerCase() || '~';
      if (target === '~' || target === '~/arceus-web' || target === '/') {
        ctx.setCwd('~/arceus-web');
      } else if (target === 'src' || target === './src' || target === '~/arceus-web/src') {
        ctx.setCwd('~/arceus-web/src');
      } else if (
        target === 'exemplos' ||
        target === 'examples' ||
        target === './exemplos' ||
        target === '~/arceus-web/exemplos'
      ) {
        ctx.setCwd('~/arceus-web/exemplos');
      } else if (target === '..') {
        ctx.setCwd(ctx.cwd === '~/arceus-web' ? '~/arceus-web' : '~/arceus-web');
      } else {
        ctx.emit('error', `Diretório não encontrado: '${rest[0]}'`);
        return false;
      }
      return true;
    }

    if (cmd === 'ls' || cmd === 'dir') {
      const longMode = rest.includes('-l') || rest.includes('-la') || rest.includes('-al');
      const dirArg = rest.find((a) => !a.startsWith('-'))?.toLowerCase();

      const showExamples =
        dirArg === 'exemplos' ||
        dirArg === 'examples' ||
        (!dirArg && ctx.cwd === '~/arceus-web/exemplos');

      const showRoot = !dirArg && ctx.cwd === '~/arceus-web';

      if (showRoot) {
        emitTarget('code', 'drwxr-xr-x  src/       (' + ctx.files.length + ' arquivos)\ndrwxr-xr-x  exemplos/  (' + EXAMPLES.length + ' modelos)');
        flushRedirect();
        return true;
      }

      if (showExamples) {
        const lines = EXAMPLES.map((ex) =>
          longMode
            ? `-r--r--r--  ${String(ex.code.split('\n').length).padStart(3)} linhas  [${ex.category.padEnd(10)}]  ${ex.id}.ml`
            : `${ex.id}.ml`
        );
        emitTarget('code', longMode ? lines.join('\n') : lines.join('   '));
        flushRedirect();
        return true;
      }

      const lines = ctx.files.map((f) => {
        const isActive = f.id === ctx.activeFile.id;
        if (longMode) {
          const lc = f.content.split('\n').length;
          return `${isActive ? '* ' : '  '}${String(lc).padStart(4)} linhas  ${String(
            f.content.length
          ).padStart(5)} B   ${f.name}`;
        }
        return `${isActive ? '* ' : ''}${f.name}`;
      });
      emitTarget('code', longMode ? lines.join('\n') : lines.join('   '));
      flushRedirect();
      return true;
    }

    if (cmd === 'cat' || cmd === 'type') {
      const numbered = rest.includes('-n');
      const fileArg = rest.find((a) => !a.startsWith('-'));
      const resolved = resolveWorkspaceOrExampleFile(fileArg, ctx.files, ctx.activeFile);
      if (!resolved.file && !resolved.example) {
        ctx.emit('error', `Arquivo não encontrado: '${fileArg}'.`);
        return false;
      }
      const content = resolved.file ? resolved.file.content : resolved.example!.code;
      const output = numbered
        ? content
            .split('\n')
            .map((line, i) => `${String(i + 1).padStart(3)} | ${line}`)
            .join('\n')
        : content;
      emitTarget('code', output);
      flushRedirect();
      return true;
    }

    if (cmd === 'touch' || cmd === 'new') {
      const name = rest[0];
      if (!name) {
        ctx.emit('error', `Uso: ${cmd} <nome_do_arquivo.ml>`);
        return false;
      }
      const normalized = name.includes('.') ? name : `${name}.ml`;
      const existing = ctx.files.find((f) => f.name.toLowerCase() === normalized.toLowerCase());
      if (existing) {
        ctx.activeFile = existing;
        ctx.selectFile(existing.id);
        emitTarget('info', `Arquivo '${existing.name}' já existe e foi focado no editor.`);
        return true;
      }
      const created = ctx.createFile(normalized);
      ctx.files.push(created);
      ctx.activeFile = created;
      emitTarget('success', `✓ Criado '${created.name}' e aberto no editor.`);
      flushRedirect();
      return true;
    }

    if (cmd === 'open' || cmd === 'edit') {
      const name = rest[0];
      if (!name) {
        ctx.emit('error', 'Uso: open <arquivo>');
        return false;
      }
      const resolved = resolveWorkspaceOrExampleFile(name, ctx.files, ctx.activeFile);
      if (resolved.file) {
        ctx.activeFile = resolved.file;
        ctx.selectFile(resolved.file.id);
        emitTarget('success', `✓ Editando '${resolved.file.name}'.`);
        return true;
      }
      if (resolved.example) {
        const created = ctx.createFile(`${resolved.example.id}.ml`, resolved.example.code);
        ctx.files.push(created);
        ctx.activeFile = created;
        emitTarget('success', `✓ Exemplo '${created.name}' aberto no workspace.`);
        return true;
      }
      ctx.emit('error', `Arquivo não encontrado: '${name}'.`);
      return false;
    }

    if (cmd === 'rm' || cmd === 'del') {
      const name = rest[0];
      if (!name) {
        ctx.emit('error', 'Uso: rm <arquivo>');
        return false;
      }
      const resolved = resolveWorkspaceOrExampleFile(name, ctx.files, ctx.activeFile);
      if (!resolved.file) {
        ctx.emit('error', `Arquivo '${name}' não encontrado no workspace.`);
        return false;
      }
      if (ctx.files.length <= 1) {
        ctx.emit('warn', 'Não é possível remover o último arquivo aberto do projeto.');
        return false;
      }
      ctx.closeFile(resolved.file.id);
      ctx.files = ctx.files.filter((f) => f.id !== resolved.file!.id);
      if (ctx.activeFile.id === resolved.file.id && ctx.files[0]) {
        ctx.activeFile = ctx.files[0];
      }
      emitTarget('success', `✓ Removido '${resolved.file.name}'.`);
      return true;
    }

    if (cmd === 'mv' || cmd === 'rename') {
      const [srcName, destName] = rest;
      if (!srcName || !destName) {
        ctx.emit('error', `Uso: ${cmd} <origem> <destino>`);
        return false;
      }
      const resolved = resolveWorkspaceOrExampleFile(srcName, ctx.files, ctx.activeFile);
      if (!resolved.file) {
        ctx.emit('error', `Arquivo '${srcName}' não encontrado.`);
        return false;
      }
      const normalizedDest = destName.includes('.') ? destName : `${destName}.ml`;
      resolved.file.name = normalizedDest;
      ctx.renameFile(resolved.file.id, destName);
      emitTarget('success', `✓ Renomeado para '${normalizedDest}'.`);
      return true;
    }

    if (cmd === 'cp') {
      const [srcName, destName] = rest;
      if (!srcName || !destName) {
        ctx.emit('error', 'Uso: cp <origem> <destino>');
        return false;
      }
      const resolved = resolveWorkspaceOrExampleFile(srcName, ctx.files, ctx.activeFile);
      if (!resolved.file && !resolved.example) {
        ctx.emit('error', `Arquivo '${srcName}' não encontrado.`);
        return false;
      }
      const content = resolved.file ? resolved.file.content : resolved.example!.code;
      const saved = ctx.upsertFile(destName, content, false);
      const existingIdx = ctx.files.findIndex((f) => f.id === saved.id);
      if (existingIdx !== -1) ctx.files[existingIdx] = saved;
      else ctx.files.push(saved);
      ctx.activeFile = saved;
      ctx.selectFile(saved.id);
      emitTarget('success', `✓ Copiado para '${saved.name}'.`);
      return true;
    }

    if (cmd === 'grep') {
      const ignoreCase = rest.includes('-i');
      const positional = rest.filter((a) => !a.startsWith('-'));
      const pattern = positional[0];
      if (!pattern) {
        ctx.emit('error', 'Uso: grep [-i] <texto> [arquivo]');
        return false;
      }
      const targetFileArg = positional[1];
      const filesToSearch = targetFileArg
        ? [resolveWorkspaceOrExampleFile(targetFileArg, ctx.files, ctx.activeFile).file].filter(
            Boolean
          ) as EditorFile[]
        : ctx.files;

      if (filesToSearch.length === 0) {
        ctx.emit('error', `Arquivo '${targetFileArg}' não encontrado.`);
        return false;
      }

      const needle = ignoreCase ? pattern.toLowerCase() : pattern;
      let matchesCount = 0;

      filesToSearch.forEach((f) => {
        f.content.split('\n').forEach((lineText, idx) => {
          const hay = ignoreCase ? lineText.toLowerCase() : lineText;
          if (hay.includes(needle)) {
            matchesCount++;
            emitTarget('code', `${f.name}:${idx + 1}: ${lineText.trim()}`, {
              file: f.name,
              line: idx + 1,
              column: 1,
            });
          }
        });
      });

      if (matchesCount === 0) {
        emitTarget('muted', `Nenhuma ocorrência para '${pattern}'.`);
      }
      flushRedirect();
      return true;
    }

    if (cmd === 'wc') {
      const fileArg = rest.find((a) => !a.startsWith('-'));
      const resolved = resolveWorkspaceOrExampleFile(fileArg, ctx.files, ctx.activeFile);
      if (!resolved.file) {
        ctx.emit('error', `Arquivo '${fileArg}' não encontrado.`);
        return false;
      }
      const text = resolved.file.content;
      const lines = text.split('\n').length;
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const chars = text.length;
      emitTarget('code', `  ${lines} linhas   ${words} palavras   ${chars} caracteres   ${resolved.file.name}`);
      flushRedirect();
      return true;
    }

    if (cmd === 'echo') {
      emitTarget('stdout', rest.join(' '));
      flushRedirect();
      return true;
    }

    if (cmd === 'examples' || cmd === 'exemplos' || cmd === 'example') {
      const sub = rest[0]?.toLowerCase();
      if (sub === 'load' && rest[1]) {
        const ex = EXAMPLES.find((e) => e.id.toLowerCase().includes(rest[1].toLowerCase()));
        if (!ex) {
          ctx.emit('error', `Exemplo '${rest[1]}' não encontrado.`);
          return false;
        }
        const created = ctx.createFile(`${ex.id}.ml`, ex.code);
        emitTarget('success', `✓ Exemplo '${ex.title}' carregado em '${created.name}'.`);
        return true;
      }
      emitTarget('info', 'Exemplos MiniLang Disponíveis (use "examples load <id>"):');
      emitTarget(
        'code',
        EXAMPLES.map((ex) => `  ${ex.id.padEnd(22)}  [${ex.category.padEnd(10)}]  ${ex.title}`).join('\n')
      );
      flushRedirect();
      return true;
    }

    // 5. Temas, Aparência & Configurações
    if (cmd === 'theme' || cmd === 'tema') {
      const target = rest[0]?.toLowerCase();
      if (!target) {
        emitTarget('info', `Tema ativo: ${ctx.theme}`);
        emitTarget(
          'code',
          THEMES.map((t) => `  ${t.id === ctx.theme ? '* ' : '  '}${t.id.padEnd(14)}  ${t.name}`).join('\n')
        );
        flushRedirect();
        return true;
      }
      const found = THEMES.find((t) => t.id === target || t.name.toLowerCase().includes(target));
      if (!found) {
        ctx.emit('error', `Tema '${target}' não encontrado. Digite 'theme' para listar.`);
        return false;
      }
      ctx.setTheme(found.id);
      emitTarget('success', `✓ Tema alterado para '${found.name}'.`);
      return true;
    }

    if (cmd === 'accent') {
      const target = rest[0]?.toLowerCase() as AccentOverride | undefined;
      const valid = ['theme', ...Object.keys(ACCENT_PRESETS)];
      if (!target) {
        emitTarget('info', `Destaque atual: ${ctx.settings.accentOverride} (${valid.join(', ')})`);
        return true;
      }
      if (!valid.includes(target)) {
        ctx.emit('error', `Cor inválida. Opções: ${valid.join(', ')}`);
        return false;
      }
      ctx.updateSettings({ accentOverride: target });
      emitTarget('success', `✓ Cor de destaque definida como '${target}'.`);
      return true;
    }

    if (cmd === 'config' || cmd === 'settings') {
      const sub = rest[0]?.toLowerCase();
      if (!sub) {
        ctx.openSettings('appearance');
        emitTarget('info', 'Abrindo Configurações...');
        return true;
      }
      if (CONFIG_SECTIONS.includes(sub as SettingsTabSection)) {
        ctx.openSettings(sub as SettingsTabSection);
        emitTarget('info', `Abrindo aba '${sub}' nas Configurações...`);
        return true;
      }
      if (sub === 'set' && rest[1] && rest[2]) {
        const key = rest[1];
        const rawVal = rest[2];
        if (key === 'fontSize' && ['12px', '13px', '14px', '16px', '18px', '20px'].includes(rawVal)) {
          ctx.updateSettings({ fontSize: rawVal as EditorSettings['fontSize'] });
          emitTarget('success', `✓ fontSize = ${rawVal}`);
          return true;
        }
        if (key === 'minimap') {
          ctx.updateSettings({ showMinimap: rawVal === 'true' || rawVal === 'on' });
          emitTarget('success', `✓ showMinimap = ${rawVal === 'true' || rawVal === 'on'}`);
          return true;
        }
        if (key === 'breadcrumbs') {
          ctx.updateSettings({ showBreadcrumbs: rawVal === 'true' || rawVal === 'on' });
          emitTarget('success', `✓ showBreadcrumbs = ${rawVal === 'true' || rawVal === 'on'}`);
          return true;
        }
        if (key === 'density' && ['compact', 'comfortable', 'spacious'].includes(rawVal)) {
          ctx.updateSettings({ uiDensity: rawVal as EditorSettings['uiDensity'] });
          emitTarget('success', `✓ uiDensity = ${rawVal}`);
          return true;
        }
        ctx.emit('error', `Propriedade ou valor não suportado: ${key} ${rawVal}`);
        return false;
      }
      ctx.openSettings('appearance');
      return true;
    }

    if (cmd === 'share') {
      ctx.onShare();
      emitTarget('success', '✓ Link de compartilhamento gerado e copiado.');
      return true;
    }

    if (effectiveCmd === 'status' || cmd === 'ping') {
      const start = performance.now();
      const health = await ctx.onCheckHealth();
      const ms = Math.round(performance.now() - start);
      if (health.ok) {
        emitTarget(
          'success',
          `✓ Backend Online (${ms} ms) — Compilador: ${health.compiler || 'arceus'} • Python ${
            health.python || '3.13'
          }`
        );
        return true;
      }
      ctx.emit('error', `✗ Backend indisponível ou despertando (${ms} ms).`);
      return false;
    }

    if (cmd === 'calc') {
      if (rest.length === 0) {
        ctx.emit('error', 'Uso: calc <expressão>  (ex.: calc (10 + 20) * 3)');
        return false;
      }
      const result = evaluateSafeExpression(rest.join(' '));
      emitTarget('success', `= ${result}`);
      flushRedirect();
      return true;
    }

    if (cmd === 'history') {
      if (ctx.history.length === 0) {
        emitTarget('muted', 'Histórico vazio.');
      } else {
        emitTarget(
          'code',
          ctx.history.map((h, i) => `${String(i + 1).padStart(4)}  ${h}`).join('\n')
        );
      }
      flushRedirect();
      return true;
    }

    if (cmd === 'date') {
      emitTarget('code', new Date().toLocaleString('pt-BR'));
      flushRedirect();
      return true;
    }

    if (cmd === 'whoami') {
      emitTarget('code', 'arceus-dev');
      flushRedirect();
      return true;
    }

    if (effectiveCmd === 'version') {
      emitTarget('code', 'Arceus Web IDE v0.2.0 • Compilador MiniLang (Const Folding + AST + CFG)');
      flushRedirect();
      return true;
    }

    ctx.emit(
      'error',
      `Comando não reconhecido: '${cmd}'. Digite 'help' para ver os comandos disponíveis.`
    );
    return false;
  } catch (err) {
    ctx.emit('error', err instanceof Error ? err.message : String(err));
    return false;
  }
}
