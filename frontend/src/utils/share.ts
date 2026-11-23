/**
 * Utilitários para compartilhamento de código MiniLang via URL (deep-linking).
 */

export function encodeCodeToUrl(code: string): string {
  try {
    const bytes = new TextEncoder().encode(code);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    // URL-safe base64
    const urlSafe = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return urlSafe;
  } catch (err) {
    console.error('Falha ao codificar código para URL:', err);
    return '';
  }
}

export function decodeCodeFromUrl(hash: string): string | null {
  try {
    const clean = hash.replace(/^[#?]/, '');
    const match = clean.match(/(?:^|&)code=([^&]+)/);
    if (!match) return null;

    let base64 = match[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }

    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch (err) {
    console.error('Falha ao decodificar código da URL:', err);
    return null;
  }
}

export function getSharedCode(): string | null {
  if (typeof window === 'undefined') return null;
  return decodeCodeFromUrl(window.location.hash || window.location.search);
}

export function generateShareUrl(code: string, activeTab?: string): string {
  const encoded = encodeCodeToUrl(code);
  const tabPart = activeTab ? `${activeTab}&` : '';
  const url = new URL(window.location.href);
  url.hash = `${tabPart}code=${encoded}`;
  return url.toString();
}
