import {
  snippetCompletion,
  type Completion,
  type CompletionContext,
  type CompletionResult,
} from '@codemirror/autocomplete';
import type { SymbolInfo } from '../types';

let cachedSymbolTable: SymbolInfo[] = [];

/**
 * Atualiza o cache global da última tabela de símbolos válida
 */
export function updateSymbolTableCache(symbols: SymbolInfo[]): void {
  if (symbols && symbols.length > 0) {
    cachedSymbolTable = symbols;
  }
}

/**
 * Scanner regex local para extrair declarações de variáveis do documento atual,
 * garantindo resiliência mesmo quando há erro de sintaxe temporário na linha em edição.
 */
function scanLocalVariables(docText: string): SymbolInfo[] {
  const localSymbols: SymbolInfo[] = [];
  const lines = docText.split('\n');
  const varRegex = /\bvar\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+(inteiro|booleano)/g;

  lines.forEach((line, index) => {
    let match: RegExpExecArray | null;
    while ((match = varRegex.exec(line)) !== null) {
      localSymbols.push({
        name: match[1],
        type: match[2].toUpperCase(),
        scope: 'global',
        line: index + 1,
        column: match.index + 1,
        initialized: false,
      });
    }
  });

  return localSymbols;
}

// 1. Snippets Inteligentes com Tab-Stops (TASK-3.3)
const SNIPPETS: Completion[] = [
  snippetCompletion(
    'programa ${meu_programa} {\n  var ${x} inteiro;\n\n  ${x = 10;}\n  ${escreva x;}\n} fim.',
    {
      label: 'programa',
      detail: 'Esqueleto oficial de programa MiniLang',
      type: 'snippet',
      boost: 10,
    }
  ),
  snippetCompletion(
    'se (${condição}) {\n  ${instruções}\n}',
    {
      label: 'se',
      detail: 'Condicional simples se (...) { ... }',
      type: 'snippet',
      boost: 9,
    }
  ),
  snippetCompletion(
    'se (${condição}) {\n  ${instruções}\n} senão {\n  ${instruções_alternativas}\n}',
    {
      label: 'se-senão',
      detail: 'Condicional completa se (...) { } senão { }',
      type: 'snippet',
      boost: 9,
    }
  ),
  snippetCompletion(
    'enquanto (${condição}) {\n  ${instruções}\n}',
    {
      label: 'enquanto',
      detail: 'Laço pré-testado enquanto (...) { ... }',
      type: 'snippet',
      boost: 9,
    }
  ),
  snippetCompletion(
    'para ${i} = ${1} ate ${10} passo ${1} {\n  ${instruções}\n}',
    {
      label: 'para',
      detail: 'Laço contado para ... ate ... passo',
      type: 'snippet',
      boost: 9,
    }
  ),
  snippetCompletion(
    'repita {\n  ${instruções}\n} ate (${condição})',
    {
      label: 'repita',
      detail: 'Laço pós-testado repita { ... } ate (...)',
      type: 'snippet',
      boost: 9,
    }
  ),
  snippetCompletion(
    'var ${nome} ${inteiro};',
    {
      label: 'var',
      detail: 'Declaração de variável tipada',
      type: 'snippet',
      boost: 8,
    }
  ),
  snippetCompletion(
    'leia ${variavel};',
    {
      label: 'leia',
      detail: 'Entrada de dados pelo terminal',
      type: 'snippet',
      boost: 7,
    }
  ),
  snippetCompletion(
    'escreva ${expressao};',
    {
      label: 'escreva',
      detail: 'Saída de dados para o console',
      type: 'snippet',
      boost: 7,
    }
  ),
];

// 2. Palavras-Chave e Tipos Primitivos (TASK-3.1)
const KEYWORD_COMPLETIONS: Completion[] = [
  // Comandos estruturais
  { label: 'programa', type: 'keyword', detail: '[cmd] Declaração de início', boost: 2 },
  { label: 'var', type: 'keyword', detail: '[cmd] Seção de variáveis', boost: 2 },
  { label: 'fim.', type: 'keyword', detail: '[cmd] Encerramento do programa', boost: 2 },

  // Desvios e Laços
  { label: 'se', type: 'keyword', detail: '[cmd] Desvio condicional', boost: 2 },
  { label: 'senão', type: 'keyword', detail: '[cmd] Ramo alternativo falso', boost: 2 },
  { label: 'enquanto', type: 'keyword', detail: '[cmd] Laço pré-testado', boost: 2 },
  { label: 'para', type: 'keyword', detail: '[cmd] Laço com contador', boost: 2 },
  { label: 'ate', type: 'keyword', detail: '[cmd] Limite de repetição', boost: 2 },
  { label: 'passo', type: 'keyword', detail: '[cmd] Passo de incremento', boost: 2 },
  { label: 'repita', type: 'keyword', detail: '[cmd] Início de repita..ate', boost: 2 },

  // I/O
  { label: 'leia', type: 'keyword', detail: '[cmd] Entrada do usuário', boost: 2 },
  { label: 'escreva', type: 'keyword', detail: '[cmd] Impressão no console', boost: 2 },

  // Tipos Primitivos
  { label: 'inteiro', type: 'type', detail: '[tipo] Número inteiro (32 bits)', boost: 3 },
  { label: 'booleano', type: 'type', detail: '[tipo] Lógico (verdadeiro/falso)', boost: 3 },

  // Literais e operadores lógicos
  { label: 'verdadeiro', type: 'constant', detail: '[bool] Literal lógico true', boost: 1 },
  { label: 'falso', type: 'constant', detail: '[bool] Literal lógico false', boost: 1 },
  { label: 'e', type: 'operator', detail: '[op] Conjunção lógica AND' },
  { label: 'ou', type: 'operator', detail: '[op] Disjunção lógica OR' },
  { label: 'não', type: 'operator', detail: '[op] Negação lógica NOT' },
];

/**
 * Cria o provedor de autocompletion para MiniLang
 */
export function createMiniLangCompletionSource(currentSymbols?: SymbolInfo[]) {
  if (currentSymbols && currentSymbols.length > 0) {
    updateSymbolTableCache(currentSymbols);
  }

  return (context: CompletionContext): CompletionResult | null => {
    const word = context.matchBefore(/[\w\u00C0-\u00FF.]+/);
    if (!word && !context.explicit) return null;

    const docText = context.state.doc.toString();
    const localVars = scanLocalVariables(docText);

    // Mescla tabela em cache e variáveis locais sem duplicatas
    const mergedSymbols = new Map<string, string>();
    cachedSymbolTable.forEach((s) => mergedSymbols.set(s.name, s.type));
    localVars.forEach((s) => mergedSymbols.set(s.name, s.type));

    const variableCompletions: Completion[] = Array.from(mergedSymbols.entries()).map(
      ([name, type]) => ({
        label: name,
        type: 'variable',
        detail: `[var] ${type}`,
        info: `Variável do escopo: ${name} (${type})`,
        boost: 5,
      })
    );

    const allOptions = [...SNIPPETS, ...KEYWORD_COMPLETIONS, ...variableCompletions];

    return {
      from: word ? word.from : context.pos,
      options: allOptions,
      validFor: /^[\w\u00C0-\u00FF.]*$/,
    };
  };
}
