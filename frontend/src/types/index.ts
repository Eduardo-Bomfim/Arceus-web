export type PhaseType = "Léxico" | "Sintático" | "Semântico" | "Execução";

export interface ErrorItem {
  phase: PhaseType | string;
  line: number;
  column: number;
  message: string;
}

export interface TokenInfo {
  type: string;
  value: string;
  line: number;
  column: number;
}

export interface SymbolInfo {
  name: string;
  type: string;
  scope: string;
  line: number;
  column: number;
  initialized: boolean;
}

export interface AnalyzeResponse {
  success: boolean;
  tokens: TokenInfo[];
  ast_raw: string | null;
  ast_optimized: string | null;
  symbol_table: SymbolInfo[];
  errors: ErrorItem[];
}

export interface RunResponse {
  success: boolean;
  exit_code: number;
  stdout: string;
  errors: ErrorItem[];
  duration_ms: number;
}

export interface TerminalMessage {
  id: string;
  type: 'stdout' | 'stdin' | 'system' | 'error';
  content: string;
  timestamp: Date;
}

export type RunnerStatus =
  | "IDLE"
  | "CONNECTING"
  | "RUNNING"
  | "WAITING_INPUT"
  | "FINISHED"
  | "ERROR";

export interface WaitingInputState {
  varName: string;
  expectedType: string;
  line?: number;
  column?: number;
}

export interface HealthStatus {
  state: "checking" | "online" | "sleeping" | "offline";
  compiler?: string;
  python?: string;
  progress?: number;
}

export interface ExampleTemplate {
  id: string;
  title: string;
  description: string;
  category: "Básico" | "Extensões" | "Otimização" | "Erros";
  code: string;
}

export type ThemeId =
  | 'jetbrains'
  | 'arceus'
  | 'arceus-light'
  | 'void'
  | 'dialga'
  | 'giratina'
  | 'palkia'
  | 'rayquaza'
  | 'zekrom'
  | 'reshiram';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  subtitle: string;
  primaryColor: string;
  secondaryColor: string;
  accentBg: string;
  borderAccent: string;
  description: string;
  isDark: boolean;
  previewColors: [string, string, string, string]; // [fundo, superfície, primária, destaque]
}

export type EditorFontSize = '12px' | '13px' | '14px' | '16px' | '18px' | '20px';
export type EditorFontFamily = 'JetBrains Mono' | 'Fira Code' | 'monospace';
export type EditorLineHeight = '1.4' | '1.6' | '1.8';
export type TabSize = 2 | 4;

export type AccentOverride = 'theme' | 'blue' | 'amber' | 'cyan' | 'emerald' | 'violet' | 'rose';
export type UiDensity = 'compact' | 'comfortable' | 'spacious';
export type BorderRadiusStyle = 'sharp' | 'rounded' | 'pill';
export type SidebarPosition = 'left' | 'right';
export type TerminalFontSize = '11px' | '12px' | '13px' | '14px';
export type TerminalCursorStyle = 'block' | 'underline' | 'bar';

export interface EditorSettings {
  // Aparência & Layout
  accentOverride: AccentOverride;
  uiDensity: UiDensity;
  borderRadius: BorderRadiusStyle;
  sidebarPosition: SidebarPosition;
  showBreadcrumbs: boolean;
  showStatusBar: boolean;
  smoothAnimations: boolean;

  // Editor de Código
  fontSize: EditorFontSize;
  fontFamily: EditorFontFamily;
  lineHeight: EditorLineHeight;
  tabSize: TabSize;
  enableLigatures: boolean;
  showLineNumbers: boolean;
  highlightActiveLine: boolean;
  closeBrackets: boolean;
  editorLineWrapping: boolean;
  showMinimap: boolean;

  // Terminal & Console
  terminalFontSize: TerminalFontSize;
  terminalCursorStyle: TerminalCursorStyle;
  terminalTimestamps: boolean;
  terminalWrap: boolean;
  clearBeforeRun: boolean;

  // Compilador & Análise
  optimize: boolean;
  autoAnalyze: boolean;
  analyzeDelay: 250 | 400 | 800;
  maxSteps: 50000 | 100000 | 500000;
}
