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

export type ThemeId = 'arceus' | 'void' | 'dialga' | 'giratina';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  subtitle: string;
  primaryColor: string;
  secondaryColor: string;
  accentBg: string;
  borderAccent: string;
  description: string;
}
