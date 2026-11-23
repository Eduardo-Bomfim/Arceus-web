/**
 * Formatador e Indenter Determinístico de Código MiniLang
 * - Indentação de 2 espaços por nível de profundidade de chaves { ... }
 * - Normalização de operadores binários e atribuições
 * - Preservação estrita de comentários iniciados por #
 * - Quebras adequadas para senão e estruturas de controle
 */

export function formatMiniLangCode(source: string): string {
  if (!source) return '';

  const lines = source.split('\n');
  const formattedLines: string[] = [];
  let indentLevel = 0;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Linha vazia: preserva no máximo uma linha em branco consecutiva
    if (!trimmed) {
      if (formattedLines.length > 0 && formattedLines[formattedLines.length - 1] !== '') {
        formattedLines.push('');
      }
      continue;
    }

    // Comentários: mantêm seu conteúdo, apenas recebem a indentação atual
    if (trimmed.startsWith('#')) {
      formattedLines.push(`${'  '.repeat(indentLevel)}${trimmed}`);
      continue;
    }

    // Se a linha fecha bloco com '}' ou 'fim.', reduz o nível antes de formatar
    const closesBlock =
      trimmed.startsWith('}') ||
      trimmed.startsWith('senão') ||
      trimmed.startsWith('senao') ||
      trimmed.startsWith('fim.');

    if (closesBlock && indentLevel > 0) {
      indentLevel--;
    }

    // Trata linha que contém senão conectada a chave de fechamento: "} senão {" ou "senão {"
    let processedLine = trimmed;

    // Normaliza espaçamento ao redor de operadores binários e atribuições
    // Exceto dentro de comentários inline
    const commentIndex = processedLine.indexOf('#');
    let codePart = commentIndex >= 0 ? processedLine.substring(0, commentIndex) : processedLine;
    const commentPart = commentIndex >= 0 ? ` ${processedLine.substring(commentIndex).trim()}` : '';

    // Espaçamento padrão de atribuições e operadores
    codePart = codePart
      .replace(/\s*([=+\-*/%])\s*/g, ' $1 ')
      .replace(/\s*(==|!=|<=|>=|<|>)\s*/g, ' $1 ')
      .replace(/\s*,\s*/g, ', ')
      .replace(/\s*;\s*$/g, ';')
      .replace(/\s*\{\s*$/g, ' {')
      .replace(/\(\s+/g, '(')
      .replace(/\s+\)/g, ')')
      .replace(/\s+/g, ' ');

    // Corrige operadores compostos caso a regex de 1 caractere tenha colocado espaço
    codePart = codePart
      .replace(/=\s+=/g, '==')
      .replace(/!\s+=/g, '!=')
      .replace(/<\s+=/g, '<=')
      .replace(/>\s+=/g, '>=');

    processedLine = `${codePart.trim()}${commentPart}`;

    formattedLines.push(`${'  '.repeat(Math.max(0, indentLevel))}${processedLine}`);

    // Se a linha abre bloco com '{', incrementa nível após imprimir
    const opensBlock = trimmed.endsWith('{') || (trimmed.includes('{') && !trimmed.includes('}'));
    if (opensBlock) {
      indentLevel++;
    } else if (trimmed.startsWith('senão') || trimmed.startsWith('senao')) {
      if (trimmed.includes('{')) {
        indentLevel++;
      }
    }
  }

  return formattedLines.join('\n');
}
