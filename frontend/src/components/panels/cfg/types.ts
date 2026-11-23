export interface CfgNodeData {
  label: string;
  details?: string;
  instructions?: string[];
  startLine: number;
  endLine: number;
  isActive?: boolean;
  onNodeClick?: (startLine: number, endLine: number) => void;
  condition?: string;
  loopType?: string;
  [key: string]: unknown;
}
