import type { ExampleTemplate } from '../types';

export const EXAMPLES: ExampleTemplate[] = [
  {
    id: '01_ola_mundo',
    title: '01. Olá Mundo & Variáveis',
    description: 'Declaração de variáveis, atribuição e comando escreva.',
    category: 'Básico',
    code: `# 01 - Olá Mundo & Variáveis
programa ola_mundo {
  var x inteiro;
  var ativo booleano;

  x = 42;
  ativo = verdadeiro;

  escreva x;
} fim.`,
  },
  {
    id: '02_interativo_leia',
    title: '02. Entrada com leia & Condicional',
    description: 'Leitura interativa de dados via terminal e desvio se/senão.',
    category: 'Básico',
    code: `# 02 - Entrada interativa com leia e condicional
programa maioridade {
  var idade inteiro;

  # Digite sua idade no terminal abaixo quando solicitado:
  leia idade;

  se (idade >= 18) {
    escreva 1; # 1 = Maior de idade
  } senão {
    escreva 0; # 0 = Menor de idade
  }
} fim.`,
  },
  {
    id: '03_tabuada_para',
    title: '03. Tabuada com Laço para (Extensão D)',
    description: 'Laço contado determinístico para com passo customizado.',
    category: 'Extensões',
    code: `# 03 - Laço 'para ... ate ... passo' (Extensão Obrigatória D)
programa tabuada_sete {
  var i inteiro;
  var fator inteiro;

  fator = 7;

  # Imprime a tabuada do 7 de 1 até 10:
  para i = 1 ate 10 passo 1 {
    escreva i * fator;
  }
} fim.`,
  },
  {
    id: '04_validacao_repita',
    title: '04. Validação repita ... ate (Extensão D)',
    description: 'Laço pós-testado com critério de parada garantido.',
    category: 'Extensões',
    code: `# 04 - Laço pós-testado 'repita ... ate' (Extensão D)
programa validacao_entrada {
  var valor inteiro;

  # Repete até que o usuário digite um valor maior ou igual a 10:
  repita {
    leia valor;
    escreva valor;
  } ate (valor >= 10)
} fim.`,
  },
  {
    id: '05_dangling_else',
    title: '05. Resolução do Dangling Else',
    description: 'Demonstra a associação correta do senão ao se mais próximo.',
    category: 'Básico',
    code: `# 05 - Resolução do 'Dangling Else' na gramática
programa dangling_else {
  var a inteiro;
  var b inteiro;

  a = 1;
  b = 2;

  se (a == 1) {
    se (b == 1) {
      escreva 11;
    } senão {
      escreva 12; # Associado ao 'se (b == 1)'
    }
  }
} fim.`,
  },
  {
    id: '06_constant_folding',
    title: '06. Constant Folding (Otimizador)',
    description: 'Dobra de literais e expressões constantes em tempo de compilação.',
    category: 'Otimização',
    code: `# 06 - Demonstração de Otimização (Constant Folding)
# Ative a chave '--opt' e abra a aba 'AST' para comparar
# a árvore bruta com a árvore dobrada pelo otimizador!
programa otimizacao_expressoes {
  var total inteiro;
  var flag booleano;

  # Expressões complexas dobradas para literais simples:
  total = (10 + 20 * 2) - (15 / 3); # Reduzido a 45
  flag = verdadeiro e (não falso);    # Reduzido a verdadeiro

  escreva total;
} fim.`,
  },
  {
    id: '07_erros_didaticos',
    title: '07. Diagnósticos Didáticos (Erros)',
    description: 'Demonstra detecção de erros léxicos, sintáticos e semânticos com squiggles.',
    category: 'Erros',
    code: `# 07 - Demonstração de Diagnósticos e Recuperação em Modo Pânico
programa demonstracao_erros {
  var x inteiro;
  var status booleano;

  x = 10;

  # Erro semântico 1: variável não declarada
  y = 20;

  # Erro semântico 2: atribuição de tipo incompatível
  status = 100;

  # Erro sintático: falta ponto e vírgula antes do fechamento
  se (x > 0) {
    x = x + 1
  }
} fim.`,
  },
];
