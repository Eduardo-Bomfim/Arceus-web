import { StreamLanguage, StringStream } from '@codemirror/language';

const KEYWORDS = new Set([
  'programa',
  'var',
  'inteiro',
  'booleano',
  'se',
  'senão',
  'enquanto',
  'escreva',
  'leia',
  'verdadeiro',
  'falso',
  'e',
  'ou',
  'não',
  'fim',
  'para',
  'ate',
  'passo',
  'repita',
]);

const TYPES = new Set(['inteiro', 'booleano']);
const BOOLEAN_LITERALS = new Set(['verdadeiro', 'falso']);

export const miniLangParser = {
  name: 'minilang',
  startState() {
    return {};
  },
  token(stream: StringStream): string | null {
    if (stream.eatSpace()) return null;

    // Comentários: # até o fim da linha
    if (stream.eat('#')) {
      stream.skipToEnd();
      return 'comment';
    }

    // Literais numéricos
    if (stream.match(/^[0-9]+/)) {
      return 'number';
    }

    // Operadores relacionais compostos
    if (stream.match(/^(==|!=|<=|>=)/)) {
      return 'operator';
    }

    // Atribuição e operadores aritméticos / simples
    if (stream.match(/^(=|<|>|\+|\-|\*|\/|%)/)) {
      return 'operator';
    }

    // Delimitadores e pontuação
    if (stream.match(/^[\(\)\{\};:,.]/)) {
      return 'punctuation';
    }

    // Identificadores e palavras reservadas em Portugol
    if (stream.match(/^[a-zA-Z_áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ][a-zA-Z0-9_áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]*/)) {
      const word = stream.current().toLowerCase();
      if (TYPES.has(word)) return 'typeName';
      if (BOOLEAN_LITERALS.has(word)) return 'bool';
      if (KEYWORDS.has(word)) return 'keyword';
      return 'variableName';
    }

    stream.next();
    return 'invalid';
  },
};

export const miniLangLanguage = StreamLanguage.define(miniLangParser);
