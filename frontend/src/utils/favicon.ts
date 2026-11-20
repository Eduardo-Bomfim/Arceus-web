import type { ThemeId } from '../types';

const THEME_FAVICON_COLORS: Record<ThemeId, { primary: string; glow: string }> = {
  arceus: { primary: '#f59e0b', glow: '#10b981' },
  void: { primary: '#38bdf8', glow: '#6366f1' },
  dialga: { primary: '#06b6d4', glow: '#3b82f6' },
  giratina: { primary: '#f43f5e', glow: '#d97706' },
};

export function updateDynamicFavicon(theme: ThemeId): void {
  const colors = THEME_FAVICON_COLORS[theme] || THEME_FAVICON_COLORS.arceus;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="14" fill="#0c1017" stroke="${colors.primary}" stroke-width="2.5"/>
    <circle cx="16" cy="16" r="8" fill="none" stroke="${colors.primary}" stroke-width="1.5" stroke-dasharray="3 2"/>
    <line x1="16" y1="2" x2="16" y2="9" stroke="${colors.primary}" stroke-width="3" stroke-linecap="round"/>
    <line x1="16" y1="23" x2="16" y2="30" stroke="${colors.primary}" stroke-width="3" stroke-linecap="round"/>
    <line x1="2" y1="16" x2="9" y2="16" stroke="${colors.primary}" stroke-width="3" stroke-linecap="round"/>
    <line x1="23" y1="16" x2="30" y2="16" stroke="${colors.primary}" stroke-width="3" stroke-linecap="round"/>
    <circle cx="16" cy="9" r="2" fill="${colors.glow}"/>
    <circle cx="16" cy="23" r="2" fill="${colors.glow}"/>
    <circle cx="9" cy="16" r="2" fill="${colors.glow}"/>
    <circle cx="23" cy="16" r="2" fill="${colors.glow}"/>
    <circle cx="16" cy="16" r="2.5" fill="${colors.primary}"/>
  </svg>`;

  const dataUri = `data:image/svg+xml;base64,${btoa(svg)}`;

  let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.type = 'image/svg+xml';
  link.href = dataUri;
}
