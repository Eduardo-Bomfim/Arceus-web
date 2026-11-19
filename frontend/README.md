# 🌐 Arceus Web IDE (Playground Online MiniLang)

Interface gráfica e Web IDE moderna para o compilador e interpretador **MiniLang (Arceus)**, inspirada em plataformas didáticas como o *Portugol Webstudio*.

Permite escrever programas em MiniLang diretamente no navegador, executar interativamente via WebSocket (com suporte a `leia` e `escreva`), e inspecionar visualmente as fases do compilador: **AST antes/depois da otimização**, **Tabela de Símbolos**, **Tokens Léxicos** e **Diagnósticos de Erro com marcação inline**.

---

## 🚀 Funcionalidades

### 1. Editor de Código Especializado (CodeMirror 6)
- **Realce de sintaxe customizado da MiniLang**:
  - Palavras reservadas em português (`programa`, `var`, `inteiro`, `booleano`, `se`, `senão`, `enquanto`, `para`, `ate`, `passo`, `repita`, `escreva`, `leia`, `verdadeiro`, `falso`, `e`, `ou`, `não`, `fim`).
  - Literais inteiros e booleanos.
  - Comentários `#` e operadores aritméticos/relacionais.
- **Marcadores de erro inline (*Squiggles*)**: Erros léxicos, sintáticos e semânticos sublinhados em vermelho nas linhas e colunas exatas, com tooltips informativos.
- Numeração de linhas, fechamento automático de chaves/parênteses e tema escuro (*One Dark*).

### 2. Terminal Interativo (Estilo Portugol)
- Streaming de saídas do comando `escreva` em tempo real.
- Prompt inline interativo para o comando `leia`, aguardando digitação e envio via tecla `Enter`.
- Indicadores de tempo de execução (`duration_ms`), código de saída e botão de limpar tela.

### 3. Painéis Didáticos do Compilador (A3)
- **AST (Split View)**: Comparação lado a lado entre a **AST Original** (com tipos anotados) e a **AST Otimizada** (com literais dobrados pelo pass de *Constant Folding*).
- **Tabela de Símbolos**: Exibe variáveis declaradas, tipos (`INTEIRO`/`BOOLEANO`), nível de escopo, posição (linha/coluna) e estado de inicialização.
- **Tokens (Léxico)**: Tabela inspecionando todos os tokens emitidos pelo Scanner com filtros por tipo e busca por lexema.
- **Problemas / Diagnósticos**: Lista detalhada de erros categorizados por fase (`Léxico`, `Sintático`, `Semântico`, `Execução`), clicáveis para navegar imediatamente até a linha correspondente no editor.

### 4. Produtividade & Persistência
- **Galeria de Exemplos**: Templates prontos cobrindo desde o básico até laços da Extensão D (`para`, `repita/ate`), *Dangling Else* e demonstração de otimizador.
- **Persistência Automática**: Rascunho salvo no `localStorage` contra recarregamentos acidentais.
- **Arquivos Locais**: Botões para abrir (`.ml`) do computador e baixar o código fonte atual.
- **Cold Start Helper**: Monitoramento em segundo plano do backend com status visual (*Online*, *Acordando servidor...* para o Render free).

---

## ⌨️ Atalhos de Teclado

| Atalho | Ação |
|---|---|
| `F9` ou `Ctrl + Enter` | ▶ Executar programa MiniLang |
| `Escape` | ⏹ Interromper execução em andamento |

---

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env` ou configure no seu provedor de deploy (Cloudflare Pages / Vercel):

```env
# URL do backend FastAPI (deixe vazio em desenvolvimento para usar o proxy do Vite)
VITE_API_URL=https://arceus-api.onrender.com
```

---

## 🛠️ Comandos de Desenvolvimento

### Instalação das Dependências
```bash
npm install
```

### Iniciar Ambiente de Desenvolvimento
```bash
npm run dev
```
O servidor Vite iniciará em `http://localhost:5173`, com proxy automático para `http://127.0.0.1:8000`.

### Build de Produção
```bash
npm run build
```
Os arquivos estáticos otimizados serão gerados na pasta `/dist`.

### Pré-visualização do Build
```bash
npm run preview
```
