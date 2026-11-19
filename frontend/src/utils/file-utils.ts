const STORAGE_KEY = 'arceus_code_draft';

export function saveStoredCode(code: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch (err) {
    console.error('Falha ao salvar código no localStorage:', err);
  }
}

export function loadStoredCode(fallback: string): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved !== null && saved.trim() !== '' ? saved : fallback;
  } catch (err) {
    console.error('Falha ao ler código do localStorage:', err);
    return fallback;
  }
}

export function downloadFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename.endsWith('.ml') ? filename : `${filename}.ml`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function openLocalFile(
  onLoaded: (content: string, filename: string) => void
): void {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.ml,.txt';
  input.style.display = 'none';

  input.onchange = (e) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (typeof content === 'string') {
        onLoaded(content, file.name);
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  document.body.appendChild(input);
  input.click();
  document.body.removeChild(input);
}
