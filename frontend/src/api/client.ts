import type { AnalyzeResponse, RunResponse } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

export function getWsUrl(): string {
  if (API_BASE) {
    const wsBase = API_BASE.replace(/^http/, 'ws');
    return `${wsBase}/api/ws/run`;
  }
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/api/ws/run`;
}

export async function checkHealth(): Promise<{
  ok: boolean;
  compiler?: string;
  python?: string;
}> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(`${API_BASE}/health`, {
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) return { ok: false };
    const data = await res.json();
    return {
      ok: true,
      compiler: data.compiler,
      python: data.python,
    };
  } catch {
    return { ok: false };
  }
}

export async function analyzeCode(
  source: string,
  optimize = false,
  signal?: AbortSignal
): Promise<AnalyzeResponse> {
  const res = await fetch(`${API_BASE}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source, optimize }),
    signal,
  });

  if (!res.ok) {
    throw new Error(`Erro na API (${res.status}): ${res.statusText}`);
  }
  return res.json();
}

export async function runProgramHttp(
  source: string,
  inputs: string[] = [],
  optimize = false,
  signal?: AbortSignal
): Promise<RunResponse> {
  const res = await fetch(`${API_BASE}/api/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source, inputs, optimize }),
    signal,
  });

  if (!res.ok) {
    throw new Error(`Erro na API (${res.status}): ${res.statusText}`);
  }
  return res.json();
}
