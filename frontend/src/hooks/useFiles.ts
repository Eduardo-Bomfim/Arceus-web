import { useState, useCallback, useEffect } from 'react';
import { EXAMPLES } from '../examples';
import { decodeCodeFromUrl } from '../utils/share';

export interface EditorFile {
  id: string;
  name: string;
  content: string;
}

const STORAGE_FILES_KEY = 'arceus_editor_files_v2';
const STORAGE_ACTIVE_FILE_KEY = 'arceus_editor_active_file_id';

export function useFiles() {
  const [files, setFiles] = useState<EditorFile[]>(() => {
    // 1. Checa se há código compartilhado via URL hash
    const sharedCode = decodeCodeFromUrl(window.location.hash);
    if (sharedCode) {
      return [
        {
          id: 'shared_code',
          name: 'compartilhado.ml',
          content: sharedCode,
        },
      ];
    }

    // 2. Tenta restaurar sessão de múltiplos arquivos
    try {
      const saved = localStorage.getItem(STORAGE_FILES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }

    // 3. Fallback inicial padrão
    return [
      {
        id: 'file_1',
        name: 'programa_principal.ml',
        content: EXAMPLES[0].code,
      },
    ];
  });

  const [activeFileId, setActiveFileId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem(STORAGE_ACTIVE_FILE_KEY);
      if (savedId) return savedId;
    } catch {
      // ignore
    }
    return files[0]?.id || 'file_1';
  });

  // Salva no localStorage quando arquivos mudam
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_FILES_KEY, JSON.stringify(files));
      localStorage.setItem(STORAGE_ACTIVE_FILE_KEY, activeFileId);
    } catch {
      // ignore
    }
  }, [files, activeFileId]);

  const activeFile = files.find((f) => f.id === activeFileId) || files[0] || {
    id: 'default',
    name: 'programa.ml',
    content: '',
  };

  const updateContent = useCallback((newContent: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === activeFileId ? { ...f, content: newContent } : f))
    );
  }, [activeFileId]);

  const selectFile = useCallback((id: string) => {
    setActiveFileId(id);
  }, []);

  const sanitizeProgName = (fileName: string) => {
    const base = fileName.replace(/\.ml$/i, '').replace(/[^a-zA-Z0-9_]/g, '_');
    return base || 'principal';
  };

  const createFile = useCallback((customName?: string, customContent?: string) => {
    const id = `file_${Date.now()}`;
    const name = customName || `arquivo_${files.length + 1}.ml`;
    const progName = sanitizeProgName(name);
    // Sintaxe padrão mínima como em qualquer outra linguagem (ex: C, Java, etc.)
    const content =
      customContent !== undefined
        ? customContent
        : `programa ${progName} {\n    \n} fim.\n`;

    const newFile: EditorFile = { id, name, content };
    setFiles((prev) => [...prev, newFile]);
    setActiveFileId(id);
    return newFile;
  }, [files.length]);

  const closeFile = useCallback((id: string) => {
    setFiles((prev) => {
      if (prev.length <= 1) return prev; // Mantém pelo menos um arquivo aberto
      const nextFiles = prev.filter((f) => f.id !== id);
      if (activeFileId === id) {
        setActiveFileId(nextFiles[0].id);
      }
      return nextFiles;
    });
  }, [activeFileId]);

  const renameFile = useCallback((id: string, newName: string) => {
    const cleanName = newName.endsWith('.ml') ? newName : `${newName}.ml`;
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, name: cleanName } : f))
    );
  }, []);

  const loadExternalFile = useCallback((name: string, content: string) => {
    const id = `file_${Date.now()}`;
    const cleanName = name.endsWith('.ml') ? name : `${name}.ml`;
    const newFile: EditorFile = { id, name: cleanName, content };

    setFiles((prev) => [...prev, newFile]);
    setActiveFileId(id);
  }, []);

  return {
    files,
    activeFile,
    activeFileId,
    selectFile,
    updateContent,
    createFile,
    closeFile,
    renameFile,
    loadExternalFile,
  };
}
