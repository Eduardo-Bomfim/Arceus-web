# 🌐 Arceus Web IDE (Playground Online MiniLang)

Interface gráfica e Web IDE moderna para o compilador e interpretador **MiniLang (Arceus)**, inspirada em plataformas didáticas como o *Portugol Webstudio* e enriquecida com a estética mitológica do Pokémon Alfa **Arceus**.

Permite escrever programas em MiniLang diretamente no navegador, executar interativamente via WebSocket (com suporte a `leia` e `escreva`), e inspecionar visualmente as fases do compilador: **AST antes/depois da otimização**, **Tabela de Símbolos**, **Tokens Léxicos** e **Diagnósticos de Erro com marcação inline**.

---

## 🎨 Sistema de Temas Personalizáveis

A IDE possui seletor de temas integrado na barra superior com persistência automática no `localStorage`:

1. **✨ Arceus Divino (Tema Especial / Padrão):**
   - Inspirado no corpo platina/obsidiana, na Roda da Criação dourada (`#fbbf24`) e nas gemas esmeralda (`#10b981`) do Pokémon Arceus.
   - Realce no editor: palavras-chave em ouro divino, tipos em verde esmeralda, booleanos em vermelho rubi (olhos de Arceus) e cursor brilhante com aura sagrada.
2. **🌌 Vácuo Cósmico:**
   - Dark theme moderno e profissional de alto contraste com detalhes em ciano neon e azul sideral.
3. **⏳ Dialga Temporal:**
   - Tons profundos de cobalto, aço metálico e o brilho do diamante do tempo (`#06b6d4`).
4. **🌀 Mundo Distorção (Giratina):**
   - Estética abissal inspirada no Distortion World com detalhes carmesim escarlate (`#f43f5e`) e ouro sombrio.

---

## 🚀 Funcionalidades da Web IDE

### 1. Editor de Código Especializado (CodeMirror 6)
- **Realce de sintaxe customizado da MiniLang**:
  - Palavras reservadas em português (`programa`, `var`, `inteiro`, `booleano`, `se`, `senão`, `enquanto`, `para`, `ate`, `passo`, `repita`, `escreva`, `leia`, `verdadeiro`, `falso`, `e`, `ou`, `não`, `fim`).
  - Literais inteiros e booleanos.
  - Comentários `#` e operadores aritméticos/relacionais.
- **Marcadores de erro inline (*Squiggles*)**: Erros léxicos, sintáticos e semânticos sublinhados em vermelho nas linhas e colunas exatas, com tooltips informativos.
- Numeração de linhas, fechamento automático de chaves/parênteses e seleção temática com brilho adaptativo.

### 2. Terminal Interativo (Estilo Portugol)
- Streaming de saídas do comando `escreva` em tempo real.
- Prompt inline interativo para o comando `leia`, aguardando digitação e envio via tecla `Enter`.
- Indicadores de tempo de execução (`duration_ms`), código de saída e botão de limpar tela.

### 3. Painéis Didáticos do Compilador (A3)
- **AST (Split View)**: Comparação lado a lado entre a **AST Original** (com tipos anotados) e a **AST Otimizada** (com literais dobrados pelo pass de *Constant Folding*).
- **Tabela de Símbolos**: Exibe variáveis declaradas, tipos (`INTEIRO`/`BOOLEANO`), nível de escopo, posição (linha/coluna) e estado de inicialização.
- **Tokens (Léxico)**: Tabela inspecionando todos os tokens emitidos pelo Scanner com filtros por tipo e busca por lexema.
- **Problemas / Diagnósticos**: Lista detalhada de erros categorizados por fase (`Léxico`, `Sintático`, `Semântico`, `Execução`), clicáveis para navegar imediatamente até a linha correspondente no editor.

### 4. Barra de Status Inferior (IDE Bar)
- Exibe coordenadas em tempo real do cursor (**Linha e Coluna**).
- Contadores de linhas e caracteres do documento.
- Indicador do tema ativo e status de conexão com a API do compilador.

### 5. Produtividade & Persistência
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
