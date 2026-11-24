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

function normalizeFileName(rawName: string): string {
  const trimmed = rawName.trim();
  if (!trimmed) return 'sem_titulo.ml';
  return trimmed.includes('.') ? trimmed : `${trimmed}.ml`;
}

export function useFiles() {
  const [files, setFiles] = useState<EditorFile[]>(() => {
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

  const updateContent = useCallback(
    (newContent: string) => {
      setFiles((prev) =>
        prev.map((f) => (f.id === activeFileId ? { ...f, content: newContent } : f))
      );
    },
    [activeFileId]
  );

  const updateFileContentById = useCallback((id: string, newContent: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, content: newContent } : f))
    );
  }, []);

  const selectFile = useCallback((id: string) => {
    setActiveFileId(id);
  }, []);

  const sanitizeProgName = (fileName: string) => {
    const base = fileName.replace(/\.[a-z0-9]+$/i, '').replace(/[^a-zA-Z0-9_]/g, '_');
    return base || 'principal';
  };

  const createFile = useCallback(
    (customName?: string, customContent?: string) => {
      const id = `file_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const name = customName ? normalizeFileName(customName) : `arquivo_${files.length + 1}.ml`;
      const progName = sanitizeProgName(name);
      const content =
        customContent !== undefined
          ? customContent
          : `programa ${progName} {\n  \n} fim.\n`;

      const newFile: EditorFile = { id, name, content };
      setFiles((prev) => [...prev, newFile]);
      setActiveFileId(id);
      return newFile;
    },
    [files.length]
  );

  const upsertFile = useCallback(
    (rawName: string, newContent: string, append = false): EditorFile => {
      const targetName = normalizeFileName(rawName);
      const existing = files.find(
        (f) => f.name.toLowerCase() === targetName.toLowerCase()
      );

      if (existing) {
        const updatedContent = append
          ? (existing.content.endsWith('\n') ? existing.content : `${existing.content}\n`) +
            newContent
          : newContent;
        const updatedFile: EditorFile = { ...existing, content: updatedContent };
        setFiles((prev) => prev.map((f) => (f.id === existing.id ? updatedFile : f)));
        return updatedFile;
      }

      const created: EditorFile = {
        id: `file_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: targetName,
        content: newContent,
      };
      setFiles((prev) => [...prev, created]);
      return created;
    },
    [files]
  );

  const closeFile = useCallback(
    (id: string) => {
      setFiles((prev) => {
        if (prev.length <= 1) return prev;
        const nextFiles = prev.filter((f) => f.id !== id);
        if (activeFileId === id) {
          setActiveFileId(nextFiles[0].id);
        }
        return nextFiles;
      });
    },
    [activeFileId]
  );

  const renameFile = useCallback((id: string, newName: string) => {
    const cleanName = normalizeFileName(newName);
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, name: cleanName } : f))
    );
  }, []);

  const loadExternalFile = useCallback((name: string, content: string) => {
    const id = `file_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const cleanName = normalizeFileName(name);
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
    updateFileContentById,
    createFile,
    upsertFile,
    closeFile,
    renameFile,
    loadExternalFile,
  };
}
